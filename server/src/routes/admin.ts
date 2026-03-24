import { z } from 'zod';
import { router, adminProcedure, ownerProcedure } from '../trpc';
import { db } from '../db';
import {
  users, deposits, withdrawals, vipOrders, vipLevels,
  globalSettings, activityLogs, orderCompletions
} from '../db/schema';
import { eq, and, desc, sql, count, sum } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { hashPassword, generateInviteCode } from '../utils/auth';

export const adminRouter = router({
  // Dashboard stats
  getDashboard: adminProcedure.query(async ({ ctx }) => {
    const isOwner = ctx.user.role === 'owner';

    let userFilter = isOwner ? undefined : eq(users.subAdminId, ctx.user.userId);
    let depositFilter = undefined;
    let withdrawalFilter = undefined;

    if (!isOwner) {
      // Get member IDs for this sub-admin
      const members = await db.select({ id: users.id }).from(users)
        .where(eq(users.subAdminId, ctx.user.userId));
      const memberIds = members.map(m => m.id);

      if (memberIds.length === 0) {
        return {
          totalUsers: 0,
          totalDeposits: '0.00',
          totalWithdrawals: '0.00',
          pendingDeposits: 0,
          pendingWithdrawals: 0,
          todayNewUsers: 0,
        };
      }
    }

    const allUsers = userFilter
      ? await db.select().from(users).where(userFilter)
      : await db.select().from(users).where(eq(users.role, 'member'));

    const memberIds = allUsers.map(u => u.id);

    const allDeposits = memberIds.length > 0
      ? await db.select().from(deposits).where(sql`${deposits.userId} IN (${sql.join(memberIds.map(id => sql`${id}`), sql`,`)})`)
      : [];

    const allWithdrawals = memberIds.length > 0
      ? await db.select().from(withdrawals).where(sql`${withdrawals.userId} IN (${sql.join(memberIds.map(id => sql`${id}`), sql`,`)})`)
      : [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalUsers: allUsers.length,
      totalDeposits: allDeposits
        .filter(d => d.status === 'approved')
        .reduce((sum, d) => sum + parseFloat(d.amount), 0).toFixed(2),
      totalWithdrawals: allWithdrawals
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + parseFloat(w.amount), 0).toFixed(2),
      pendingDeposits: allDeposits.filter(d => d.status === 'pending').length,
      pendingWithdrawals: allWithdrawals.filter(w => w.status === 'pending').length,
      todayNewUsers: allUsers.filter(u => new Date(u.createdAt) >= today).length,
    };
  }),

  // Users management
  getUsers: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const isOwner = ctx.user.role === 'owner';
      const page = input?.page || 1;
      const limit = input?.limit || 20;

      let query;
      if (isOwner) {
        query = await db.select().from(users).orderBy(desc(users.createdAt));
      } else {
        query = await db.select().from(users)
          .where(eq(users.subAdminId, ctx.user.userId))
          .orderBy(desc(users.createdAt));
      }

      return query.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        balance: u.balance,
        commission: u.commission,
        frozenBalance: u.frozenBalance,
        vipLevel: u.vipLevel,
        currentOrderIndex: u.currentOrderIndex,
        inviteCode: u.inviteCode,
        invitedBy: u.invitedBy,
        isActive: u.isActive,
        phone: u.phone,
        email: u.email,
        createdAt: u.createdAt,
      }));
    }),

  // Update user
  updateUser: adminProcedure
    .input(z.object({
      userId: z.number(),
      balance: z.string().optional(),
      vipLevel: z.number().optional(),
      currentOrderIndex: z.number().optional(),
      isActive: z.boolean().optional(),
      frozenBalance: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const isOwner = ctx.user.role === 'owner';

      // Verify access
      if (!isOwner) {
        const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
        if (!targetUser || targetUser.subAdminId !== ctx.user.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot manage this user' });
        }
      }

      const updateData: any = { updatedAt: new Date() };
      if (input.balance !== undefined) updateData.balance = input.balance;
      if (input.vipLevel !== undefined) updateData.vipLevel = input.vipLevel;
      if (input.currentOrderIndex !== undefined) updateData.currentOrderIndex = input.currentOrderIndex;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.frozenBalance !== undefined) updateData.frozenBalance = input.frozenBalance;

      await db.update(users).set(updateData).where(eq(users.id, input.userId));

      // Log activity
      await db.insert(activityLogs).values({
        userId: ctx.user.userId,
        action: 'update_user',
        details: JSON.stringify({ targetUserId: input.userId, changes: input }),
      });

      return { success: true };
    }),

  // Deposits management
  getDeposits: adminProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const isOwner = ctx.user.role === 'owner';

      let allDeposits;
      if (isOwner) {
        allDeposits = await db.select().from(deposits).orderBy(desc(deposits.createdAt));
      } else {
        const members = await db.select({ id: users.id }).from(users)
          .where(eq(users.subAdminId, ctx.user.userId));
        const memberIds = members.map(m => m.id);
        if (memberIds.length === 0) return [];
        allDeposits = await db.select().from(deposits)
          .where(sql`${deposits.userId} IN (${sql.join(memberIds.map(id => sql`${id}`), sql`,`)})`)
          .orderBy(desc(deposits.createdAt));
      }

      if (input?.status) {
        allDeposits = allDeposits.filter(d => d.status === input.status);
      }

      // Enrich with username
      const enriched = await Promise.all(allDeposits.map(async (d) => {
        const [user] = await db.select({ username: users.username }).from(users).where(eq(users.id, d.userId)).limit(1);
        return { ...d, username: user?.username || 'Unknown' };
      }));

      return enriched;
    }),

  // Approve/Reject deposit
  reviewDeposit: adminProcedure
    .input(z.object({
      depositId: z.number(),
      status: z.enum(['approved', 'rejected']),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [deposit] = await db.select().from(deposits).where(eq(deposits.id, input.depositId)).limit(1);
      if (!deposit) throw new TRPCError({ code: 'NOT_FOUND' });
      if (deposit.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Deposit already reviewed' });

      // Verify access for sub-admin
      if (ctx.user.role === 'subadmin') {
        const [member] = await db.select().from(users).where(eq(users.id, deposit.userId)).limit(1);
        if (!member || member.subAdminId !== ctx.user.userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }

      await db.update(deposits).set({
        status: input.status,
        reviewedBy: ctx.user.userId,
        reviewNote: input.note,
        updatedAt: new Date(),
      }).where(eq(deposits.id, input.depositId));

      // If approved, add balance to user
      if (input.status === 'approved') {
        const [user] = await db.select().from(users).where(eq(users.id, deposit.userId)).limit(1);
        if (user) {
          const newBalance = parseFloat(user.balance) + parseFloat(deposit.amount);
          await db.update(users).set({
            balance: newBalance.toFixed(2),
            updatedAt: new Date(),
          }).where(eq(users.id, deposit.userId));
        }
      }

      await db.insert(activityLogs).values({
        userId: ctx.user.userId,
        action: `deposit_${input.status}`,
        details: JSON.stringify({ depositId: input.depositId, amount: deposit.amount }),
      });

      return { success: true };
    }),

  // Withdrawals management
  getWithdrawals: adminProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const isOwner = ctx.user.role === 'owner';

      let allWithdrawals;
      if (isOwner) {
        allWithdrawals = await db.select().from(withdrawals).orderBy(desc(withdrawals.createdAt));
      } else {
        const members = await db.select({ id: users.id }).from(users)
          .where(eq(users.subAdminId, ctx.user.userId));
        const memberIds = members.map(m => m.id);
        if (memberIds.length === 0) return [];
        allWithdrawals = await db.select().from(withdrawals)
          .where(sql`${withdrawals.userId} IN (${sql.join(memberIds.map(id => sql`${id}`), sql`,`)})`)
          .orderBy(desc(withdrawals.createdAt));
      }

      if (input?.status) {
        allWithdrawals = allWithdrawals.filter(w => w.status === input.status);
      }

      const enriched = await Promise.all(allWithdrawals.map(async (w) => {
        const [user] = await db.select({ username: users.username }).from(users).where(eq(users.id, w.userId)).limit(1);
        return { ...w, username: user?.username || 'Unknown' };
      }));

      return enriched;
    }),

  // Approve/Reject withdrawal
  reviewWithdrawal: adminProcedure
    .input(z.object({
      withdrawalId: z.number(),
      status: z.enum(['approved', 'rejected']),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, input.withdrawalId)).limit(1);
      if (!withdrawal) throw new TRPCError({ code: 'NOT_FOUND' });
      if (withdrawal.status !== 'pending') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already reviewed' });

      if (ctx.user.role === 'subadmin') {
        const [member] = await db.select().from(users).where(eq(users.id, withdrawal.userId)).limit(1);
        if (!member || member.subAdminId !== ctx.user.userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }

      await db.update(withdrawals).set({
        status: input.status,
        reviewedBy: ctx.user.userId,
        reviewNote: input.note,
        updatedAt: new Date(),
      }).where(eq(withdrawals.id, input.withdrawalId));

      // If rejected, unfreeze the amount
      if (input.status === 'rejected') {
        const [user] = await db.select().from(users).where(eq(users.id, withdrawal.userId)).limit(1);
        if (user) {
          const newBalance = parseFloat(user.balance) + parseFloat(withdrawal.amount);
          const newFrozen = parseFloat(user.frozenBalance) - parseFloat(withdrawal.amount);
          await db.update(users).set({
            balance: newBalance.toFixed(2),
            frozenBalance: Math.max(0, newFrozen).toFixed(2),
            updatedAt: new Date(),
          }).where(eq(users.id, withdrawal.userId));
        }
      } else {
        // Approved: remove from frozen
        const [user] = await db.select().from(users).where(eq(users.id, withdrawal.userId)).limit(1);
        if (user) {
          const newFrozen = parseFloat(user.frozenBalance) - parseFloat(withdrawal.amount);
          await db.update(users).set({
            frozenBalance: Math.max(0, newFrozen).toFixed(2),
            updatedAt: new Date(),
          }).where(eq(users.id, withdrawal.userId));
        }
      }

      await db.insert(activityLogs).values({
        userId: ctx.user.userId,
        action: `withdrawal_${input.status}`,
        details: JSON.stringify({ withdrawalId: input.withdrawalId, amount: withdrawal.amount }),
      });

      return { success: true };
    }),

  // VIP Orders management
  getVipOrders: adminProcedure
    .input(z.object({ vipLevel: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const isOwner = ctx.user.role === 'owner';
      const conditions = [];

      if (!isOwner) {
        conditions.push(eq(vipOrders.subAdminId, ctx.user.userId));
      }
      if (input?.vipLevel) {
        conditions.push(eq(vipOrders.vipLevel, input.vipLevel));
      }

      const query = conditions.length > 0
        ? await db.select().from(vipOrders).where(and(...conditions)).orderBy(asc(vipOrders.vipLevel), asc(vipOrders.orderIndex))
        : await db.select().from(vipOrders).orderBy(asc(vipOrders.vipLevel), asc(vipOrders.orderIndex));

      return query;
    }),

  // Create/Update VIP Order
  upsertVipOrder: adminProcedure
    .input(z.object({
      id: z.number().optional(),
      vipLevel: z.number(),
      orderIndex: z.number(),
      productName: z.string(),
      productImage: z.string().optional(),
      price: z.string(),
      commissionRate: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const subAdminId = ctx.user.role === 'subadmin' ? ctx.user.userId : null;

      if (input.id) {
        await db.update(vipOrders).set({
          vipLevel: input.vipLevel,
          orderIndex: input.orderIndex,
          productName: input.productName,
          productImage: input.productImage,
          price: input.price,
          commissionRate: input.commissionRate,
          updatedAt: new Date(),
        }).where(eq(vipOrders.id, input.id));
      } else {
        await db.insert(vipOrders).values({
          vipLevel: input.vipLevel,
          orderIndex: input.orderIndex,
          productName: input.productName,
          productImage: input.productImage,
          price: input.price,
          commissionRate: input.commissionRate,
          subAdminId: subAdminId,
        });
      }

      return { success: true };
    }),

  // Bulk create VIP orders
  bulkCreateVipOrders: adminProcedure
    .input(z.object({
      vipLevel: z.number(),
      orders: z.array(z.object({
        orderIndex: z.number(),
        productName: z.string(),
        productImage: z.string().optional(),
        price: z.string(),
        commissionRate: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const subAdminId = ctx.user.role === 'subadmin' ? ctx.user.userId : null;

      // Delete existing orders for this level
      if (subAdminId) {
        await db.delete(vipOrders).where(and(
          eq(vipOrders.vipLevel, input.vipLevel),
          eq(vipOrders.subAdminId, subAdminId),
        ));
      } else {
        await db.delete(vipOrders).where(
          eq(vipOrders.vipLevel, input.vipLevel),
        );
      }

      // Insert new orders
      const values = input.orders.map(o => ({
        vipLevel: input.vipLevel,
        orderIndex: o.orderIndex,
        productName: o.productName,
        productImage: o.productImage,
        price: o.price,
        commissionRate: o.commissionRate,
        subAdminId: subAdminId,
      }));

      if (values.length > 0) {
        await db.insert(vipOrders).values(values);
      }

      return { success: true };
    }),

  deleteVipOrder: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(vipOrders).where(eq(vipOrders.id, input.id));
      return { success: true };
    }),

  // Sub-admin management (owner only)
  getSubAdmins: ownerProcedure.query(async () => {
    return db.select().from(users)
      .where(eq(users.role, 'subadmin'))
      .orderBy(desc(users.createdAt));
  }),

  createSubAdmin: ownerProcedure
    .input(z.object({
      username: z.string().min(3),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      const existing = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Username already exists' });
      }

      const hashedPassword = await hashPassword(input.password);
      const inviteCode = generateInviteCode();

      const [subAdmin] = await db.insert(users).values({
        username: input.username,
        password: hashedPassword,
        role: 'subadmin',
        inviteCode: inviteCode,
      }).returning();

      return {
        id: subAdmin.id,
        username: subAdmin.username,
        inviteCode: subAdmin.inviteCode,
      };
    }),

  // Get members for a specific sub-admin (for View Members modal)
  getSubAdminMembers: ownerProcedure
    .input(z.object({ subAdminId: z.number() }))
    .query(async ({ input }) => {
      const members = await db.select().from(users)
        .where(and(
          eq(users.subAdminId, input.subAdminId),
          eq(users.role, 'member'),
        ))
        .orderBy(desc(users.createdAt));

      return members.map(m => ({
        id: m.id,
        username: m.username,
        balance: m.balance,
        vipLevel: m.vipLevel,
        isActive: m.isActive,
        createdAt: m.createdAt,
      }));
    }),

  // Global settings
  getSettings: adminProcedure.query(async ({ ctx }) => {
    const isOwner = ctx.user.role === 'owner';

    if (isOwner) {
      return db.select().from(globalSettings).orderBy(globalSettings.key);
    } else {
      return db.select().from(globalSettings)
        .where(eq(globalSettings.subAdminId, ctx.user.userId))
        .orderBy(globalSettings.key);
    }
  }),

  updateSetting: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const subAdminId = ctx.user.role === 'subadmin' ? ctx.user.userId : null;

      const existing = await db.select().from(globalSettings)
        .where(and(
          eq(globalSettings.key, input.key),
          subAdminId ? eq(globalSettings.subAdminId, subAdminId) : sql`${globalSettings.subAdminId} IS NULL`,
        ))
        .limit(1);

      if (existing.length > 0) {
        await db.update(globalSettings).set({
          value: input.value,
          updatedAt: new Date(),
        }).where(eq(globalSettings.id, existing[0].id));
      } else {
        await db.insert(globalSettings).values({
          key: input.key,
          value: input.value,
          subAdminId: subAdminId,
        });
      }

      return { success: true };
    }),

  // Activity logs
  getActivityLogs: adminProcedure
    .input(z.object({ limit: z.number().default(100) }).optional())
    .query(async ({ ctx, input }) => {
      const isOwner = ctx.user.role === 'owner';
      const lim = input?.limit || 100;

      if (isOwner) {
        return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(lim);
      } else {
        return db.select().from(activityLogs)
          .where(eq(activityLogs.userId, ctx.user.userId))
          .orderBy(desc(activityLogs.createdAt))
          .limit(lim);
      }
    }),

  // Reset user password (admin)
  resetUserPassword: adminProcedure
    .input(z.object({
      userId: z.number(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role === 'subadmin') {
        const [target] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
        if (!target || target.subAdminId !== ctx.user.userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
      }

      const hashed = await hashPassword(input.newPassword);
      await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, input.userId));

      return { success: true };
    }),
});

// Need to import asc
import { asc } from 'drizzle-orm';
