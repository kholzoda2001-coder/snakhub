import { prisma } from './prisma';

export async function sendTelegramNotification(message: string) {
  try {
    const tokenSetting = await prisma.settings.findUnique({ where: { key: 'telegram_bot_token' } });
    const chatIdSetting = await prisma.settings.findUnique({ where: { key: 'telegram_chat_id' } });

    const botToken = tokenSetting?.value;
    const chatId = chatIdSetting?.value;

    if (!botToken || !chatIdSetting?.value) {
      console.warn("Telegram bot token or chat ID is missing. Notification skipped.");
      return false;
    }

    const chatIds = chatIdSetting.value.split(',').map(id => id.trim()).filter(Boolean);
    let allSuccess = true;

    for (const id of chatIds) {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: id,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Telegram API Error for ID ${id}:`, errorData);
        allSuccess = false;
      }
    }

    return allSuccess;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}
