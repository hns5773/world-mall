import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { generateCaptcha, verifyCaptcha } from '../utils/captcha';
import { TRPCError } from '@trpc/server';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      username: z.string().min(3).max(50),
      password: z.string().min(6).max(100),
      inviteCode: z.string().min(1),
      phone: z.string().optional(),
      language: z.string().default('en'),
    }))
    .mutation(async ({ input }) => {
      // Check if username exists
      const existing = await db.select().from(users).where(eq(users.username, input.username)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Username already exists' });
      }

      // Find the sub-admin with this invite code
      const subAdmin = await db.select().from(users)
        .where(and(eq(users.inviteCode, input.inviteCode), eq(users.role, 'subadmin')))
        .limit(1);

      if (subAdmin.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid invite code' });
      }

      const hashedPassword = await hashPassword(input.password);

      const [newUser] = await db.insert(users).values({
        username: input.username,
        password: hashedPassword,
        role: 'member',
        invitedBy: input.inviteCode,
        subAdminId: subAdmin[0].id,
        phone: input.phone,
        language: input.language,
      }).returning();

      const token = generateToken({
        userId: newUser.id,
        username: newUser.username,
        role: 'member',
      });

      return { token, user: { id: newUser.id, username: newUser.username, role: newUser.role } };
    }),

  login: publicProcedure
    .input(z.object({
      username: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const [user] = await db.select().from(users).where(eq(users.username, input.username)).limit(1);

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Account is disabled' });
      }

      const valid = await comparePassword(input.password, user.password);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          vipLevel: user.vipLevel,
          balance: user.balance,
          language: user.language,
        },
      };
    }),

  // Admin login with CAPTCHA verification
  adminLogin: publicProcedure
    .input(z.object({
      username: z.string(),
      password: z.string(),
      captchaId: z.string(),
      captchaText: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Verify CAPTCHA first
      const captchaValid = verifyCaptcha(input.captchaId, input.captchaText);
      if (!captchaValid) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '验证码错误或已过期' });
      }

      const [user] = await db.select().from(users).where(eq(users.username, input.username)).limit(1);

      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户名或密码错误' });
      }

      // Only allow owner and subadmin roles
      if (user.role === 'member') {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '无权限访问管理后台' });
      }

      if (!user.isActive) {
        throw new TRPCError({ code: 'FORBIDDEN', message: '账号已被禁用' });
      }

      const valid = await comparePassword(input.password, user.password);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: '用户名或密码错误' });
      }

      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          vipLevel: user.vipLevel,
          balance: user.balance,
          language: user.language,
        },
      };
    }),

  // Get CAPTCHA image
  getCaptcha: publicProcedure.query(() => {
    return generateCaptcha();
  }),

  // Refresh CAPTCHA
  refreshCaptcha: publicProcedure.mutation(() => {
    return generateCaptcha();
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.userId)).limit(1);
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      balance: user.balance,
      commission: user.commission,
      frozenBalance: user.frozenBalance,
      vipLevel: user.vipLevel,
      currentOrderIndex: user.currentOrderIndex,
      inviteCode: user.inviteCode,
      invitedBy: user.invitedBy,
      phone: user.phone,
      email: user.email,
      language: user.language,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      username: z.string().min(3).optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      language: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.update(users).set({
        ...input,
        updatedAt: new Date(),
      }).where(eq(users.id, ctx.user.userId));
      return { success: true };
    }),

  changePassword: protectedProcedure
    .input(z.object({
      oldPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ ctx, input }) => {
      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.userId)).limit(1);
      if (!user) throw new TRPCError({ code: 'NOT_FOUND' });

      const valid = await comparePassword(input.oldPassword, user.password);
      if (!valid) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Old password is incorrect' });

      const hashed = await hashPassword(input.newPassword);
      await db.update(users).set({ password: hashed, updatedAt: new Date() }).where(eq(users.id, ctx.user.userId));
      return { success: true };
    }),
});
