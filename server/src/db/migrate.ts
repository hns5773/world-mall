import { db, pool } from './index';
import { sql } from 'drizzle-orm';
import * as schema from './schema';
import 'dotenv/config';

async function migrate() {
  console.log('🔄 Running database setup...');

  try {
    // Create enums
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('owner', 'subadmin', 'member');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE deposit_status AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE message_direction AS ENUM ('member_to_admin', 'admin_to_member');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role user_role NOT NULL DEFAULT 'member',
        balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        commission DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        frozen_balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        vip_level INTEGER NOT NULL DEFAULT 1,
        invite_code VARCHAR(50),
        invited_by VARCHAR(50),
        sub_admin_id INTEGER,
        current_order_index INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        phone VARCHAR(50),
        email VARCHAR(255),
        language VARCHAR(10) NOT NULL DEFAULT 'en',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vip_levels (
        id SERIAL PRIMARY KEY,
        level INTEGER NOT NULL,
        name VARCHAR(100) NOT NULL,
        required_deposit DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        sub_admin_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS vip_orders (
        id SERIAL PRIMARY KEY,
        vip_level INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_image VARCHAR(500),
        price DECIMAL(18,2) NOT NULL,
        commission_rate DECIMAL(5,2) NOT NULL,
        sub_admin_id INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS order_completions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        vip_order_id INTEGER NOT NULL,
        vip_level INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        price DECIMAL(18,2) NOT NULL,
        commission_earned DECIMAL(18,2) NOT NULL,
        completed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS deposits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        currency VARCHAR(20) NOT NULL DEFAULT 'USDT',
        tx_hash VARCHAR(255),
        screenshot_url VARCHAR(500),
        status deposit_status NOT NULL DEFAULT 'pending',
        reviewed_by INTEGER,
        review_note TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS withdrawals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        currency VARCHAR(20) NOT NULL DEFAULT 'USDT',
        wallet_address VARCHAR(255) NOT NULL,
        status withdrawal_status NOT NULL DEFAULT 'pending',
        reviewed_by INTEGER,
        review_note TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        direction message_direction NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS global_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL,
        value TEXT NOT NULL,
        sub_admin_id INTEGER,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create unique constraint on global_settings key + sub_admin_id
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_global_settings_key_subadmin
      ON global_settings (key, COALESCE(sub_admin_id, 0));
    `);

    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);
