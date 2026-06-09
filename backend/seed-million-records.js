import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Configuration
const BATCH_SIZE = 5000;
const TARGET_COUNTS = {
  users: 100000,      // 100k users
  products: 50000,    // 50k products
  carts: 80000,       // 80k carts
  cartItems: 770000   // 770k cart items
};

// Helper: Generate random string
function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Helper: Generate random number in range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Format time
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${seconds}s`;
}

// Step 1: Insert Users
async function seedUsers() {
  console.log('\n🔵 STEP 1: Seeding Users...');
  const startTime = Date.now();
  let totalInserted = 0;

  // Pre-hash a single password to reuse (much faster than hashing each one)
  const hashedPassword = await bcrypt.hash('password123', 10);

  const totalBatches = Math.ceil(TARGET_COUNTS.users / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = Date.now();
    const users = [];

    for (let i = 0; i < BATCH_SIZE && totalInserted < TARGET_COUNTS.users; i++) {
      const userId = totalInserted + 1;
      users.push({
        first_name: `User${userId}`,
        last_name: `Last${userId}`,
        email: `user${userId}@example.com`,
        phone: `${1000000000 + userId}`,
        password: hashedPassword
      });
      totalInserted++;
    }

    await prisma.user.createMany({ data: users, skipDuplicates: true });

    const batchTime = Date.now() - batchStart;
    const elapsed = Date.now() - startTime;
    const progress = ((batch + 1) / totalBatches * 100).toFixed(1);
    
    console.log(`  ✓ Batch ${batch + 1}/${totalBatches} (${progress}%) - ${totalInserted.toLocaleString()} users - ${(batchTime / 1000).toFixed(2)}s - Total: ${formatTime(elapsed)}`);
  }

  const totalTime = Date.now() - startTime;
  console.log(`✅ Users complete: ${totalInserted.toLocaleString()} records in ${formatTime(totalTime)}`);
  return totalInserted;
}

// Step 2: Insert Products
async function seedProducts() {
  console.log('\n🟢 STEP 2: Seeding Products...');
  const startTime = Date.now();
  let totalInserted = 0;

  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys', 'Food'];
  const totalBatches = Math.ceil(TARGET_COUNTS.products / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = Date.now();
    const products = [];

    for (let i = 0; i < BATCH_SIZE && totalInserted < TARGET_COUNTS.products; i++) {
      const productId = totalInserted + 1;
      products.push({
        name: `Product ${productId} - ${categories[productId % categories.length]}`,
        description: `High quality ${categories[productId % categories.length].toLowerCase()} product`,
        price: randomInt(10, 500),
        stock_quantity: randomInt(50, 1000),
        status: 'ACTIVE'
      });
      totalInserted++;
    }

    await prisma.product.createMany({ data: products, skipDuplicates: true });

    const batchTime = Date.now() - batchStart;
    const elapsed = Date.now() - startTime;
    const progress = ((batch + 1) / totalBatches * 100).toFixed(1);
    
    console.log(`  ✓ Batch ${batch + 1}/${totalBatches} (${progress}%) - ${totalInserted.toLocaleString()} products - ${(batchTime / 1000).toFixed(2)}s - Total: ${formatTime(elapsed)}`);
  }

  const totalTime = Date.now() - startTime;
  console.log(`✅ Products complete: ${totalInserted.toLocaleString()} records in ${formatTime(totalTime)}`);
  return totalInserted;
}

// Step 3: Insert Carts
async function seedCarts(userCount) {
  console.log('\n🟡 STEP 3: Seeding Carts...');
  const startTime = Date.now();
  let totalInserted = 0;

  const totalBatches = Math.ceil(TARGET_COUNTS.carts / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = Date.now();
    const carts = [];

    for (let i = 0; i < BATCH_SIZE && totalInserted < TARGET_COUNTS.carts; i++) {
      // Randomly assign to existing users
      const userId = randomInt(1, userCount);
      const status = ['PENDING', 'CHECKED_OUT'][randomInt(0, 1)];
      
      carts.push({
        user_id: userId,
        status: status,
        total_amount: 0 // Will be updated when items are added
      });
      totalInserted++;
    }

    await prisma.cart.createMany({ data: carts, skipDuplicates: true });

    const batchTime = Date.now() - batchStart;
    const elapsed = Date.now() - startTime;
    const progress = ((batch + 1) / totalBatches * 100).toFixed(1);
    
    console.log(`  ✓ Batch ${batch + 1}/${totalBatches} (${progress}%) - ${totalInserted.toLocaleString()} carts - ${(batchTime / 1000).toFixed(2)}s - Total: ${formatTime(elapsed)}`);
  }

  const totalTime = Date.now() - startTime;
  console.log(`✅ Carts complete: ${totalInserted.toLocaleString()} records in ${formatTime(totalTime)}`);
  return totalInserted;
}

// Step 4: Insert Cart Items
async function seedCartItems(cartCount, productCount) {
  console.log('\n🔴 STEP 4: Seeding Cart Items...');
  const startTime = Date.now();
  let totalInserted = 0;

  const totalBatches = Math.ceil(TARGET_COUNTS.cartItems / BATCH_SIZE);

  for (let batch = 0; batch < totalBatches; batch++) {
    const batchStart = Date.now();
    const cartItems = [];

    for (let i = 0; i < BATCH_SIZE && totalInserted < TARGET_COUNTS.cartItems; i++) {
      const cartId = randomInt(1, cartCount);
      const productId = randomInt(1, productCount);
      const quantity = randomInt(1, 5);
      const price = randomInt(10, 500);

      cartItems.push({
        cart_id: cartId,
        product_id: productId,
        quantity: quantity,
        price: price
      });
      totalInserted++;
    }

    await prisma.cartItem.createMany({ data: cartItems, skipDuplicates: true });

    const batchTime = Date.now() - batchStart;
    const elapsed = Date.now() - startTime;
    const progress = ((batch + 1) / totalBatches * 100).toFixed(1);
    
    console.log(`  ✓ Batch ${batch + 1}/${totalBatches} (${progress}%) - ${totalInserted.toLocaleString()} items - ${(batchTime / 1000).toFixed(2)}s - Total: ${formatTime(elapsed)}`);
  }

  const totalTime = Date.now() - startTime;
  console.log(`✅ Cart Items complete: ${totalInserted.toLocaleString()} records in ${formatTime(totalTime)}`);
  return totalInserted;
}

// Main execution
async function main() {
  const overallStart = Date.now();
  
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   🚀 BULK DATA SEEDER - 1 MILLION RECORDS           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`\n📊 Target Distribution:`);
  console.log(`   • Users:      ${TARGET_COUNTS.users.toLocaleString()}`);
  console.log(`   • Products:   ${TARGET_COUNTS.products.toLocaleString()}`);
  console.log(`   • Carts:      ${TARGET_COUNTS.carts.toLocaleString()}`);
  console.log(`   • Cart Items: ${TARGET_COUNTS.cartItems.toLocaleString()}`);
  console.log(`   • TOTAL:      ${(TARGET_COUNTS.users + TARGET_COUNTS.products + TARGET_COUNTS.carts + TARGET_COUNTS.cartItems).toLocaleString()}`);
  console.log(`\n⚙️  Batch Size: ${BATCH_SIZE.toLocaleString()} records per batch`);
  console.log(`\n🕐 Starting at: ${new Date().toLocaleString()}\n`);

  try {
    const userCount = await seedUsers();
    const productCount = await seedProducts();
    const cartCount = await seedCarts(userCount);
    const cartItemCount = await seedCartItems(cartCount, productCount);

    const totalRecords = userCount + productCount + cartCount + cartItemCount;
    const totalTime = Date.now() - overallStart;

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   ✅ SEEDING COMPLETE!                               ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`\n📈 Final Statistics:`);
    console.log(`   • Total Records:  ${totalRecords.toLocaleString()}`);
    console.log(`   • Total Time:     ${formatTime(totalTime)}`);
    console.log(`   • Avg Speed:      ${Math.floor(totalRecords / (totalTime / 1000)).toLocaleString()} records/sec`);
    console.log(`   • Completed:      ${new Date().toLocaleString()}`);
    console.log(`\n🎉 Database is now populated with test data!`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   • Test with: curl http://localhost:5001/api/users`);
    console.log(`   • Or via ALB: curl http://cart-api-alb-810038360.eu-north-1.elb.amazonaws.com/api/users`);
    console.log(``);

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
