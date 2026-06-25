import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { key: 'telegram_bot_token' },
    update: { value: '8858761471:AAH2Ug_2oyZb3QbhO39wyWes3uUGXphR3ro' },
    create: { key: 'telegram_bot_token', value: '8858761471:AAH2Ug_2oyZb3QbhO39wyWes3uUGXphR3ro' }
  });

  await prisma.settings.upsert({
    where: { key: 'telegram_chat_id' },
    update: { value: '5540944478' },
    create: { key: 'telegram_chat_id', value: '5540944478' }
  });

  console.log("Telegram settings seeded successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
