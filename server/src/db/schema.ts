import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'subadmin', 'member']);
export const depositStatusEnum = pgEnum('deposit_status', ['pending', 'approved', 'rejected']);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'approved', 'rejected']);
export const messageDirectionEnum = pgEnum('message_direction', ['member_to_admin', 'admin_to_member']);
export const notificationTypeEnum = pgEnum('notification_type', ['new_deposit', 'new_withdrawal', 'new_member', 'new_message']);

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('member'),
  balance: decimal('balance', { precision: 18, scale: 2 }).notNull().default('0.00'),
  commission: decimal('commission', { precision: 18, scale: 2 }).notNull().default('0.00'),
  frozenBalance: decimal('frozen_balance', { precision: 18, scale: 2 }).notNull().default('0.00'),
  vipLevel: integer('vip_level').notNull().default(1),
  inviteCode: varchar('invite_code', { length: 50 }),
  invitedBy: varchar('invited_by', { length: 50 }),
  subAdminId: integer('sub_admin_id'),
  currentOrderIndex: integer('current_order_index').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// VIP Levels table
export const vipLevels = pgTable('vip_levels', {
  id: serial('id').primaryKey(),
  level: integer('level').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  requiredDeposit: decimal('required_deposit', { precision: 18, scale: 2 }).notNull().default('0.00'),
  subAdminId: integer('sub_admin_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// VIP Orders (product configurations per VIP level)
export const vipOrders = pgTable('vip_orders', {
  id: serial('id').primaryKey(),
  vipLevel: integer('vip_level').notNull(),
  orderIndex: integer('order_index').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productImage: varchar('product_image', { length: 500 }),
  price: decimal('price', { precision: 18, scale: 2 }).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(),
  subAdminId: integer('sub_admin_id'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Order completions (member order history)
export const orderCompletions = pgTable('order_completions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  vipOrderId: integer('vip_order_id').notNull(),
  vipLevel: integer('vip_level').notNull(),
  orderIndex: integer('order_index').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 18, scale: 2 }).notNull(),
  commissionEarned: decimal('commission_earned', { precision: 18, scale: 2 }).notNull(),
  completedAt: timestamp('completed_at').notNull().defaultNow(),
});

// Deposits
export const deposits = pgTable('deposits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 20 }).notNull().default('USDT'),
  txHash: varchar('tx_hash', { length: 255 }),
  screenshotUrl: varchar('screenshot_url', { length: 500 }),
  status: depositStatusEnum('status').notNull().default('pending'),
  reviewedBy: integer('reviewed_by'),
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Withdrawals
export const withdrawals = pgTable('withdrawals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 20 }).notNull().default('USDT'),
  walletAddress: varchar('wallet_address', { length: 255 }).notNull(),
  status: withdrawalStatusEnum('status').notNull().default('pending'),
  reviewedBy: integer('reviewed_by'),
  reviewNote: text('review_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Chat messages
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').notNull(),
  receiverId: integer('receiver_id').notNull(),
  message: text('message').notNull(),
  direction: messageDirectionEnum('direction').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Global settings
export const globalSettings = pgTable('global_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  subAdminId: integer('sub_admin_id'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Activity logs
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  adminId: integer('admin_id').notNull(),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  relatedUserId: integer('related_user_id'),
  relatedEntityId: integer('related_entity_id'),
  isRead: boolean('is_read').notNull().default(false),
  actionUrl: varchar('action_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type VipLevel = typeof vipLevels.$inferSelect;
export type VipOrder = typeof vipOrders.$inferSelect;
export type OrderCompletion = typeof orderCompletions.$inferSelect;
export type Deposit = typeof deposits.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type GlobalSetting = typeof globalSettings.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
