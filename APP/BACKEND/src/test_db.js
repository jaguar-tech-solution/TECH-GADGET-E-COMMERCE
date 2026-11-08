// src/test-db.js
import { prisma } from './lib/prisma.js';

console.log(prisma)

async function testDatabase() {
  console.log("Starting DB tests...\n");

  try {
    // 1. CREATE: Insert Role & User
    const role = await prisma.role.create({
      data: { name: 'CUSTOMER', description: 'Store Customer' },
    });

    const user = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        passwordHash: 'hashed_password_sample',
        userRoles: {
          create: { roleId: role.id },
        },
      },
    });
    console.log("✅ User & Role created:", user.id);

    // 2. READ: Query user with relations
    const fetchedUser = await prisma.user.findUnique({
      where: { email: 'john.doe@example.com' },
      include: { userRoles: { include: { role: true } } },
    });
    console.log("✅ Read User with Role:", fetchedUser.userRoles[0].role.name);

    // 3. CHECK CONSTRAINT TEST: Negative product price should throw DB error
    console.log("\nTesting CHECK constraint (negative price)...");
    const category = await prisma.category.create({
      data: { name: 'Smartphones', slug: 'smartphones' },
    });

    await prisma.product.create({
      data: {
        name: 'Invalid Product',
        slug: 'invalid-prod',
        sku: 'INV-001',
        priceMinor: -500n, // Triggers chk_products_price_non_negative
        categoryId: category.id,
      },
    });
  } catch (error) {
    if (error.message.includes('chk_products_price_non_negative')) {
      console.log("✅ CHECK Constraint working: Rejected negative price.");
    } else {
      console.error("❌ Test error:", error);
    }
  } finally {
    // 4. CLEANUP: Delete test records
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
   await prisma.category.deleteMany({});
   await prisma.$disconnect();
    console.log("\n✅ Test completed & cleaned up.");
  }
}

testDatabase();