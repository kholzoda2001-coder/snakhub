import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Run with: TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... npx tsx scratch_telegram_seed.ts
// The bot token used to be hardcoded here — never put credentials back in this file.
async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID before running this script.');
  }

  await prisma.settings.upsert({
    where: { key: 'telegram_bot_token' },
    update: { value: token },
    create: { key: 'telegram_bot_token', value: token }
  });

  await prisma.settings.upsert({
    where: { key: 'telegram_chat_id' },
    update: { value: chatId },
    create: { key: 'telegram_chat_id', value: chatId }
  });

  console.log("Telegram settings seeded successfully.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
