import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from '../trpc';
import { db } from '../db';
import { chatMessages, users } from '../db/schema';
import { eq, and, or, desc, asc, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const chatRouter = router({
  // Member: send message to their sub-admin
  sendMessage: protectedProcedure
    .input(z.object({
      receiverId: z.number(),
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const direction = ctx.user.role === 'member' ? 'member_to_admin' : 'admin_to_member';

      const [msg] = await db.insert(chatMessages).values({
        senderId: ctx.user.userId,
        receiverId: input.receiverId,
        message: input.message,
        direction: direction as any,
      }).returning();

      return msg;
    }),

  // Get messages between two users
  getMessages: protectedProcedure
    .input(z.object({
      otherUserId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const messages = await db.select().from(chatMessages)
        .where(or(
          and(eq(chatMessages.senderId, ctx.user.userId), eq(chatMessages.receiverId, input.otherUserId)),
          and(eq(chatMessages.senderId, input.otherUserId), eq(chatMessages.receiverId, ctx.user.userId)),
        ))
        .orderBy(asc(chatMessages.createdAt));

      // Mark as read
      await db.update(chatMessages).set({ isRead: true })
        .where(and(
          eq(chatMessages.senderId, input.otherUserId),
          eq(chatMessages.receiverId, ctx.user.userId),
          eq(chatMessages.isRead, false),
        ));

      return messages;
    }),

  // Member: get their sub-admin info for chat
  getChatPartner: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === 'member') {
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.userId)).limit(1);
      if (!user || !user.subAdminId) throw new TRPCError({ code: 'NOT_FOUND' });

      const [admin] = await db.select({ id: users.id, username: users.username })
        .from(users).where(eq(users.id, user.subAdminId)).limit(1);
      return admin ? [admin] : [];
    }
    return [];
  }),

  // Admin: get list of members with chat
  getChatMembers: adminProcedure.query(async ({ ctx }) => {
    const isOwner = ctx.user.role === 'owner';

    let members;
    if (isOwner) {
      members = await db.select({ id: users.id, username: users.username })
        .from(users).where(eq(users.role, 'member'));
    } else {
      members = await db.select({ id: users.id, username: users.username })
        .from(users).where(eq(users.subAdminId, ctx.user.userId));
    }

    // Get unread count for each member
    const enriched = await Promise.all(members.map(async (m) => {
      const unread = await db.select().from(chatMessages)
        .where(and(
          eq(chatMessages.senderId, m.id),
          eq(chatMessages.receiverId, ctx.user.userId),
          eq(chatMessages.isRead, false),
        ));

      const lastMsg = await db.select().from(chatMessages)
        .where(or(
          and(eq(chatMessages.senderId, m.id), eq(chatMessages.receiverId, ctx.user.userId)),
          and(eq(chatMessages.senderId, ctx.user.userId), eq(chatMessages.receiverId, m.id)),
        ))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1);

      return {
        ...m,
        unreadCount: unread.length,
        lastMessage: lastMsg[0]?.message || '',
        lastMessageAt: lastMsg[0]?.createdAt || null,
      };
    }));

    return enriched.sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const unread = await db.select().from(chatMessages)
      .where(and(
        eq(chatMessages.receiverId, ctx.user.userId),
        eq(chatMessages.isRead, false),
      ));
    return { count: unread.length };
  }),
});
