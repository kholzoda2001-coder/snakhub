const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Monster category
  await prisma.category.update({
    where: { id: 2 },
    data: {
      name: 'Monster Energy',
      icon: '🟢',
      img: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?w=400&q=80' 
    }
  });

  // Create Monster Product
  await prisma.product.create({
    data: {
      name: 'Monster Energy Drink, Original Green, 500ml (24 Pack)',
      cat: 'monster',
      catLabel: 'Monster Energy',
      price: 155.00,
      oldPrice: 170.00,
      tag: 'hot',
      tagLabel: 'POPULAR',
      img: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?w=800&q=80',
      desc: 'Tear into a can of Monster Energy, the meanest energy drink on the planet. 24 x 500ml cans packed with a powerful punch and a smooth, easy-drinking flavor.',
      stock: 40,
    }
  });

  console.log('Successfully updated category and added Monster product.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
