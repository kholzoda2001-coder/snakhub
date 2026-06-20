import { prisma } from './prisma';

export async function sendTelegramNotification(message: string) {
  try {
    const tokenSetting = await prisma.settings.findUnique({ where: { key: 'telegram_bot_token' } });
    const chatIdSetting = await prisma.settings.findUnique({ where: { key: 'telegram_chat_id' } });

    const botToken = tokenSetting?.value;
    const chatId = chatIdSetting?.value;

    if (!botToken || !chatId) {
      console.warn("Telegram bot token or chat ID is missing. Notification skipped.");
      return false;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Telegram API Error:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
}
