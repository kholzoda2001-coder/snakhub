const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.create({
    data: {
      name: 'Red Bull Energy Drink, Summer Edition (Juneberry), 250ml (24 Pack)',
      cat: 'redbull',
      catLabel: 'Red Bull',
      price: 145.00,
      oldPrice: 160.00,
      tag: 'hot',
      tagLabel: 'NEW',
      img: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800&q=80',
      desc: 'Crack open a cold Red Bull Summer Edition Juneberry. A refreshing burst of berry flavor with the classic Red Bull energy boost. 24 x 250ml cans. Perfect for staying energized during long days!',
      stock: 50,
    }
  });
  console.log('Created product:', product);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
