import { db, pool } from '../db';
import { vipOrders } from '../db/schema';
import { eq } from 'drizzle-orm';
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

async function reseedImages() {
  console.log('🖼️  Updating VIP order product images...');

  const allOrders = await db.select().from(vipOrders);
  console.log(`Found ${allOrders.length} orders to update`);

  let updated = 0;
  for (const order of allOrders) {
    // Assign image based on order index to get variety
    const imageIndex = order.orderIndex % productImages.length;
    const newImage = productImages[imageIndex];

    await db.update(vipOrders)
      .set({ productImage: newImage, updatedAt: new Date() })
      .where(eq(vipOrders.id, order.id));
    updated++;
  }

  console.log(`✅ Updated ${updated} orders with real product images`);
  await pool.end();
}

reseedImages().catch(console.error);
