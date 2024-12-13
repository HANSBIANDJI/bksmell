import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Floral',
          description: 'Floral fragrances',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Woody',
          description: 'Woody fragrances',
        },
      }),
    ]);

    // Create perfumes
    await Promise.all([
      prisma.perfume.create({
        data: {
          name: 'Rose Garden',
          description: 'A beautiful floral scent',
          brand: 'Luxury Scents',
          price: 99.99,
          categoryId: categories[0].id,
          imageUrl: 'https://example.com/rose-garden.jpg',
          stock: 100,
        },
      }),
      prisma.perfume.create({
        data: {
          name: 'Cedar Woods',
          description: 'A deep woody fragrance',
          brand: 'Nature\'s Best',
          price: 129.99,
          categoryId: categories[1].id,
          imageUrl: 'https://example.com/cedar-woods.jpg',
          stock: 50,
        },
      }),
    ]);

    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
