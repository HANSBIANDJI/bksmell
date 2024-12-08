import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');

    // Test creating a category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Test Description'
      }
    });
    console.log('✅ Successfully created test category:', category);

    // Test creating a perfume
    const perfume = await prisma.perfume.create({
      data: {
        name: 'Test Perfume',
        brand: 'Test Brand',
        price: 99.99,
        image: 'https://example.com/test.jpg',
        categoryId: category.id,
        description: 'Test Description',
        stock: 10
      }
    });
    console.log('✅ Successfully created test perfume:', perfume);

    // Clean up test data
    await prisma.perfume.delete({ where: { id: perfume.id } });
    await prisma.category.delete({ where: { id: category.id } });
    console.log('✅ Successfully cleaned up test data');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
