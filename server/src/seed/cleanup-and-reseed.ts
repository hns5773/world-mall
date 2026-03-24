import { db, pool } from '../db';
import { users, vipOrders, vipLevels, globalSettings } from '../db/schema';
import { hashPassword, generateInviteCode } from '../utils/auth';
import { eq, sql } from 'drizzle-orm';
import 'dotenv/config';

// Real product images from Unsplash (specific photo IDs)
const productImages = [
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop', // iPhone
  'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&h=200&fit=crop', // Samsung phone
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop', // MacBook
  'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop', // iPad
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', // Watch
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop', // Burger/Food
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&h=200&fit=crop', // Hotel
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop', // Sofa/Furniture
  'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop', // TV
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop', // Shoes
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop', // Coffee
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop', // Laptop
];

const sampleProducts = [
  { name: 'iPhone 15 Pro Max', imgIdx: 0 },
  { name: 'Samsung Galaxy S24 Ultra', imgIdx: 1 },
  { name: 'MacBook Pro 16"', imgIdx: 2 },
  { name: 'iPad Air M2', imgIdx: 3 },
  { name: 'Apple Watch Ultra 2', imgIdx: 4 },
  { name: 'Gourmet Burger Set', imgIdx: 5 },
  { name: 'Luxury Hotel Suite', imgIdx: 6 },
  { name: 'Designer Sofa', imgIdx: 7 },
  { name: 'Samsung OLED TV 65"', imgIdx: 8 },
  { name: 'Nike Air Max 90', imgIdx: 9 },
  { name: 'Premium Coffee Set', imgIdx: 10 },
  { name: 'Dell XPS 15 Laptop', imgIdx: 11 },
  { name: 'iPhone 15 Pro', imgIdx: 0 },
  { name: 'Samsung Galaxy Z Fold 5', imgIdx: 1 },
  { name: 'MacBook Air M3', imgIdx: 2 },
  { name: 'iPad Pro 12.9"', imgIdx: 3 },
  { name: 'Rolex Submariner', imgIdx: 4 },
  { name: 'Wagyu Steak Set', imgIdx: 5 },
  { name: 'Beach Resort Package', imgIdx: 6 },
  { name: 'Italian Leather Sofa', imgIdx: 7 },
  { name: 'LG OLED C3 55"', imgIdx: 8 },
  { name: 'Adidas Yeezy 350', imgIdx: 9 },
  { name: 'Nespresso Machine', imgIdx: 10 },
  { name: 'Lenovo ThinkPad X1', imgIdx: 11 },
  { name: 'iPhone 14 Plus', imgIdx: 0 },
  { name: 'Samsung Galaxy A54', imgIdx: 1 },
  { name: 'MacBook Pro 14"', imgIdx: 2 },
  { name: 'iPad Mini 6', imgIdx: 3 },
  { name: 'Omega Speedmaster', imgIdx: 4 },
  { name: 'Sushi Deluxe Set', imgIdx: 5 },
  { name: 'Mountain Lodge Stay', imgIdx: 6 },
  { name: 'Scandinavian Armchair', imgIdx: 7 },
  { name: 'Sony Bravia XR 75"', imgIdx: 8 },
  { name: 'New Balance 550', imgIdx: 9 },
  { name: 'Starbucks Gift Box', imgIdx: 10 },
  { name: 'HP Spectre x360', imgIdx: 11 },
  { name: 'Google Pixel 8 Pro', imgIdx: 0 },
  { name: 'OnePlus 12', imgIdx: 1 },
  { name: 'Surface Pro 9', imgIdx: 2 },
  { name: 'Kindle Scribe', imgIdx: 3 },
  { name: 'TAG Heuer Carrera', imgIdx: 4 },
  { name: 'Pizza Party Set', imgIdx: 5 },
  { name: 'City Hotel Premium', imgIdx: 6 },
  { name: 'Ergonomic Office Chair', imgIdx: 7 },
  { name: 'TCL 4K TV 55"', imgIdx: 8 },
  { name: 'Puma RS-X', imgIdx: 9 },
  { name: 'Tea Collection Box', imgIdx: 10 },
  { name: 'ASUS ZenBook 14', imgIdx: 11 },
  { name: 'iPhone SE 2024', imgIdx: 0 },
  { name: 'Samsung Galaxy S23', imgIdx: 1 },
  { name: 'MacBook Air 13"', imgIdx: 2 },
  { name: 'iPad 10th Gen', imgIdx: 3 },
  { name: 'Casio G-Shock', imgIdx: 4 },
  { name: 'BBQ Grill Set', imgIdx: 5 },
  { name: 'Spa Resort Package', imgIdx: 6 },
  { name: 'Recliner Chair', imgIdx: 7 },
  { name: 'Hisense TV 50"', imgIdx: 8 },
  { name: 'Converse Chuck 70', imgIdx: 9 },
  { name: 'Espresso Maker', imgIdx: 10 },
  { name: 'Acer Swift 5', imgIdx: 11 },
  { name: 'Xiaomi 14 Ultra', imgIdx: 0 },
  { name: 'Motorola Edge 40', imgIdx: 1 },
  { name: 'Chromebook Plus', imgIdx: 2 },
  { name: 'Fire HD 10 Tablet', imgIdx: 3 },
  { name: 'Seiko Presage', imgIdx: 4 },
  { name: 'Dim Sum Feast', imgIdx: 5 },
  { name: 'Treehouse Cabin', imgIdx: 6 },
  { name: 'Dining Table Set', imgIdx: 7 },
  { name: 'Philips Ambilight TV', imgIdx: 8 },
  { name: 'Vans Old Skool', imgIdx: 9 },
  { name: 'French Press Set', imgIdx: 10 },
  { name: 'MSI Creator Laptop', imgIdx: 11 },
  { name: 'Nothing Phone 2', imgIdx: 0 },
  { name: 'Realme GT 5 Pro', imgIdx: 1 },
  { name: 'Razer Blade 15', imgIdx: 2 },
  { name: 'Samsung Tab S9', imgIdx: 3 },
  { name: 'Tissot PRX', imgIdx: 4 },
  { name: 'Ramen Box Set', imgIdx: 5 },
  { name: 'Lakeside Resort', imgIdx: 6 },
  { name: 'Bookshelf Unit', imgIdx: 7 },
  { name: 'Vizio M-Series TV', imgIdx: 8 },
  { name: 'Jordan 1 Retro', imgIdx: 9 },
  { name: 'Matcha Latte Kit', imgIdx: 10 },
  { name: 'LG Gram 17', imgIdx: 11 },
  { name: 'ASUS ROG Phone 8', imgIdx: 0 },
  { name: 'Sony Xperia 1 V', imgIdx: 1 },
  { name: 'Framework Laptop', imgIdx: 2 },
  { name: 'Lenovo Tab P12', imgIdx: 3 },
  { name: 'Hamilton Khaki', imgIdx: 4 },
  { name: 'Taco Fiesta Pack', imgIdx: 5 },
  { name: 'Ski Lodge Stay', imgIdx: 6 },
  { name: 'Standing Desk', imgIdx: 7 },
  { name: 'Samsung Frame TV', imgIdx: 8 },
  { name: 'Asics Gel-Kayano', imgIdx: 9 },
  { name: 'Cold Brew Maker', imgIdx: 10 },
  { name: 'Apple Mac Mini M3', imgIdx: 11 },
  { name: 'Huawei Mate 60 Pro', imgIdx: 0 },
  { name: 'ZTE Axon 50 Ultra', imgIdx: 1 },
  { name: 'Alienware m16', imgIdx: 2 },
  { name: 'Wacom Cintiq Pro', imgIdx: 3 },
  { name: 'Garmin Fenix 7', imgIdx: 4 },
  { name: 'Seafood Platter', imgIdx: 5 },
  { name: 'Desert Oasis Hotel', imgIdx: 6 },
  { name: 'Bean Bag Lounger', imgIdx: 7 },
  { name: 'Sharp Aquos TV', imgIdx: 8 },
  { name: 'Reebok Classic', imgIdx: 9 },
  { name: 'Pour Over Coffee Kit', imgIdx: 10 },
  { name: 'Gigabyte Aero 16', imgIdx: 11 },
  { name: 'Honor Magic 6 Pro', imgIdx: 0 },
  { name: 'Oppo Find X7 Ultra', imgIdx: 1 },
  { name: 'ROG Strix G16', imgIdx: 2 },
  { name: 'Remarkable 2', imgIdx: 3 },
  { name: 'Citizen Eco-Drive', imgIdx: 4 },
  { name: 'Chocolate Gift Box', imgIdx: 5 },
  { name: 'Vineyard B&B Stay', imgIdx: 6 },
  { name: 'L-Shaped Desk', imgIdx: 7 },
  { name: 'Panasonic OLED TV', imgIdx: 8 },
  { name: 'Skechers GoWalk', imgIdx: 9 },
  { name: 'Moka Pot Set', imgIdx: 10 },
  { name: 'Razer Book 13', imgIdx: 11 },
];

// VIP level task counts: VIP1=40, VIP2=60, VIP3=80, VIP4=100, VIP5=120
const vipTaskCounts: Record<number, number> = {
  1: 40,
  2: 60,
  3: 80,
  4: 100,
  5: 120,
};

async function cleanupAndReseed() {
  console.log('🔄 Starting cleanup and reseed...');

  try {
    // Step 1: Ensure admin exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    if (existingAdmin.length === 0) {
      const adminPassword = await hashPassword('worldmall@2024');
      await db.insert(users).values({
        username: 'admin',
        password: adminPassword,
        role: 'owner',
        inviteCode: 'OWNER-MAIN',
      });
      console.log('✅ Created admin user');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    // Step 2: Ensure at least one sub-admin exists
    const existingSubAdmins = await db.select().from(users).where(eq(users.role, 'subadmin'));
    let subAdminId: number;
    if (existingSubAdmins.length === 0) {
      const subAdminPassword = await hashPassword('subadmin123');
      const inviteCode = generateInviteCode();
      const [subAdmin] = await db.insert(users).values({
        username: 'subadmin1',
        password: subAdminPassword,
        role: 'subadmin',
        inviteCode: inviteCode,
      }).returning();
      subAdminId = subAdmin.id;
      console.log(`✅ Created sub-admin with invite code: ${inviteCode}`);
    } else {
      subAdminId = existingSubAdmins[0].id;
      console.log(`ℹ️  Using existing sub-admin ID: ${subAdminId}`);
    }

    // Step 3: Ensure VIP levels exist
    const existingLevels = await db.select().from(vipLevels);
    if (existingLevels.length === 0) {
      for (let level = 1; level <= 5; level++) {
        await db.insert(vipLevels).values({
          level,
          name: `VIP ${level}`,
          requiredDeposit: (level * 100).toFixed(2),
        });
      }
      console.log('✅ Created VIP levels 1-5');
    } else {
      console.log('ℹ️  VIP levels already exist');
    }

    // Step 4: Delete ALL existing VIP orders and recreate with real product images
    await db.delete(vipOrders);
    console.log('🗑️  Cleared all VIP orders');

    let totalOrders = 0;
    for (let level = 1; level <= 5; level++) {
      const taskCount = vipTaskCounts[level];
      const orders = [];
      for (let i = 0; i < taskCount; i++) {
        const product = sampleProducts[i % sampleProducts.length];
        const basePrice = level * 50 + Math.floor(Math.random() * 200);
        const commissionRate = (0.3 + level * 0.1 + Math.random() * 0.2).toFixed(2);
        orders.push({
          vipLevel: level,
          orderIndex: i,
          productName: product.name,
          productImage: productImages[product.imgIdx],
          price: basePrice.toFixed(2),
          commissionRate: commissionRate,
          subAdminId: subAdminId,
        });
      }
      await db.insert(vipOrders).values(orders);
      totalOrders += taskCount;
      console.log(`✅ Created ${taskCount} orders for VIP ${level}`);
    }
    console.log(`✅ Total orders created: ${totalOrders}`);

    // Step 5: Ensure deposit addresses are set (USDT only, no BTC)
    const existingAddresses = await db.select().from(globalSettings).where(eq(globalSettings.key, 'deposit_addresses')).limit(1);
    if (existingAddresses.length === 0) {
      await db.insert(globalSettings).values({
        key: 'deposit_addresses',
        value: JSON.stringify([
          { currency: 'USDT (TRC20)', address: 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
          { currency: 'USDT (ERC20)', address: '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
        ]),
      });
      console.log('✅ Set deposit addresses');
    } else {
      // Update to ensure no BTC
      await db.update(globalSettings).set({
        value: JSON.stringify([
          { currency: 'USDT (TRC20)', address: 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
          { currency: 'USDT (ERC20)', address: '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
        ]),
        updatedAt: new Date(),
      }).where(eq(globalSettings.id, existingAddresses[0].id));
      console.log('✅ Updated deposit addresses (USDT only)');
    }

    // Step 6: Ensure platform name
    const existingName = await db.select().from(globalSettings).where(eq(globalSettings.key, 'platform_name')).limit(1);
    if (existingName.length === 0) {
      await db.insert(globalSettings).values({
        key: 'platform_name',
        value: 'World Mall',
      });
    }

    console.log('\n🎉 Cleanup and reseed completed successfully!');
  } catch (error) {
    console.error('❌ Cleanup and reseed failed:', error);
    // Don't throw - let the server start even if reseed fails
  } finally {
    await pool.end();
  }
}

cleanupAndReseed();
