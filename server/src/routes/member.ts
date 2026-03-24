import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { db } from '../db';
import { users, vipOrders, orderCompletions, deposits, withdrawals, globalSettings } from '../db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const memberRouter = router({
  // Get current VIP orders for the member
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.userId)).limit(1);
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

    const orders = await db.select().from(vipOrders)
      .where(and(
        eq(vipOrders.vipLevel, user.vipLevel),
        eq(vipOrders.isActive, true),
        user.subAdminId ? eq(vipOrders.subAdminId, user.subAdminId) : undefined as any,
      ))
      .orderBy(asc(vipOrders.orderIndex));

    return {
      orders,
      currentOrderIndex: user.currentOrderIndex,
      vipLevel: user.vipLevel,
      balance: user.balance,
    };
  }),

  // Complete an order
  completeOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.userId)).limit(1);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      const [order] = await db.select().from(vipOrders).where(eq(vipOrders.id, input.orderId)).limit(1);
      if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });

      // Verify sequential order
      if (order.orderIndex !== user.currentOrderIndex) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Must complete orders sequentially' });
      }

      if (order.vipLevel !== user.vipLevel) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order does not match your VIP level' });
      }

      // Check balance
      const price = parseFloat(order.price);
      const userBalance = parseFloat(user.balance);
      if (userBalance < price) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient balance' });
      }

      // Calculate commission
      const commissionRate = parseFloat(order.commissionRate);
      const commissionEarned = price * (commissionRate / 100);

      // Update user balance and commission
      const newBalance = userBalance - price + price + commissionEarned;
      const newCommission = parseFloat(user.commission) + commissionEarned;

      await db.update(users).set({
        balance: newBalance.toFixed(2),
        commission: newCommission.toFixed(2),
        currentOrderIndex: user.currentOrderIndex + 1,
        updatedAt: new Date(),
      }).where(eq(users.id, ctx.user.userId));

      // Record completion
      await db.insert(orderCompletions).values({
        userId: ctx.user.userId,
        vipOrderId: order.id,
        vipLevel: order.vipLevel,
        orderIndex: order.orderIndex,
        productName: order.productName,
        price: order.price,
        commissionEarned: commissionEarned.toFixed(2),
      });

      return {
        success: true,
        commissionEarned: commissionEarned.toFixed(2),
        newBalance: newBalance.toFixed(2),
        nextOrderIndex: user.currentOrderIndex + 1,
      };
    }),

  // Get order history
  getOrderHistory: protectedProcedure.query(async ({ ctx }) => {
    const completions = await db.select().from(orderCompletions)
      .where(eq(orderCompletions.userId, ctx.user.userId))
      .orderBy(desc(orderCompletions.completedAt));
    return completions;
  }),

  // Submit deposit
  submitDeposit: protectedProcedure
    .input(z.object({
      amount: z.string(),
      currency: z.string().default('USDT'),
      txHash: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [deposit] = await db.insert(deposits).values({
        userId: ctx.user.userId,
        amount: input.amount,
        currency: input.currency,
        txHash: input.txHash,
      }).returning();
      return deposit;
    }),

  // Get deposits
  getDeposits: protectedProcedure.query(async ({ ctx }) => {
    return db.select().from(deposits)
      .where(eq(deposits.userId, ctx.user.userId))
      .orderBy(desc(deposits.createdAt));
  }),

  // Submit withdrawal
  submitWithdrawal: protectedProcedure
    .input(z.object({
      amount: z.string(),
      currency: z.string().default('USDT'),
      walletAddress: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.userId)).limit(1);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      const amount = parseFloat(input.amount);
      const balance = parseFloat(user.balance);

      if (amount <= 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid amount' });
      if (amount > balance) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient balance' });

      // Freeze the amount
      const newBalance = balance - amount;
      const newFrozen = parseFloat(user.frozenBalance) + amount;

      await db.update(users).set({
        balance: newBalance.toFixed(2),
        frozenBalance: newFrozen.toFixed(2),
        updatedAt: new Date(),
      }).where(eq(users.id, ctx.user.userId));

      const [withdrawal] = await db.insert(withdrawals).values({
        userId: ctx.user.userId,
        amount: input.amount,
        currency: input.currency,
        walletAddress: input.walletAddress,
      }).returning();

      return withdrawal;
    }),

  // Get withdrawals
  getWithdrawals: protectedProcedure.query(async ({ ctx }) => {
    return db.select().from(withdrawals)
      .where(eq(withdrawals.userId, ctx.user.userId))
      .orderBy(desc(withdrawals.createdAt));
  }),

  // Get deposit addresses
  getDepositAddresses: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.userId)).limit(1);
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

    // Get sub-admin's deposit addresses or global ones
    const settings = await db.select().from(globalSettings)
      .where(eq(globalSettings.key, 'deposit_addresses'));

    // Try sub-admin specific first
    const subAdminSetting = settings.find(s => s.subAdminId === user.subAdminId);
    const globalSetting = settings.find(s => s.subAdminId === null || s.subAdminId === undefined);

    const setting = subAdminSetting || globalSetting;
    if (setting) {
      try {
        return JSON.parse(setting.value);
      } catch {
        return [];
      }
    }
    return [];
  }),

  // Get dashboard stats
  getDashboard: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.userId)).limit(1);
    if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

    const completions = await db.select().from(orderCompletions)
      .where(eq(orderCompletions.userId, ctx.user.userId));

    const totalOrders = await db.select().from(vipOrders)
      .where(and(
        eq(vipOrders.vipLevel, user.vipLevel),
        eq(vipOrders.isActive, true),
        user.subAdminId ? eq(vipOrders.subAdminId, user.subAdminId) : undefined as any,
      ));

    return {
      balance: user.balance,
      commission: user.commission,
      frozenBalance: user.frozenBalance,
      vipLevel: user.vipLevel,
      currentOrderIndex: user.currentOrderIndex,
      totalOrders: totalOrders.length,
      completedOrders: completions.length,
      todayEarnings: completions
        .filter(c => {
          const today = new Date();
          const cDate = new Date(c.completedAt);
          return cDate.toDateString() === today.toDateString();
        })
        .reduce((sum, c) => sum + parseFloat(c.commissionEarned), 0)
        .toFixed(2),
    };
  }),
});
