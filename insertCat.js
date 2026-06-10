const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.category.create({
    data: {
      slug: 'redbull',
      name: 'Red Bull',
      icon: '⚡',
      img: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=200&q=80'
    }
  });
  console.log('Created category:', cat);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
