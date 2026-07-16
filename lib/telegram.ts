import { getSettings } from './settings';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Order rows store cart items, which use `qty`. Older rows may use `quantity`,
 * so both are accepted.
 */
export function formatOrderItems(items: unknown) {
  let parsed = items;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch { return 'Items unavailable'; }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return 'Items unavailable';

  return parsed
    .map((item: any) => `• ${item?.qty ?? item?.quantity ?? 1}x ${escapeHtml(item?.name)}`)
    .join('\n');
}

type OrderLike = {
  id: number;
  name: string;
  phone: string;
  address: string;
  total: number;
  items: unknown;
};

export function buildOrderMessage(title: string, order: OrderLike) {
  return `${title}

🧾 <b>Order:</b> #${order.id}
👤 <b>Name:</b> ${escapeHtml(order.name)}
📞 <b>Phone:</b> ${escapeHtml(order.phone)}
📍 <b>Address:</b> ${escapeHtml(order.address)}
💰 <b>Total:</b> ${order.total} AED
🛒 <b>Items:</b>
${formatOrderItems(order.items)}`;
}

export async function sendTelegramNotification(message: string) {
  try {
    const settings = await getSettings(['telegram_bot_token', 'telegram_chat_id']);
    const botToken = settings.telegram_bot_token;
    const chatIdValue = settings.telegram_chat_id;

    if (!botToken || !chatIdValue) {
      console.warn('Telegram bot token or chat ID is missing. Notification skipped.');
      return false;
    }

    const chatIds = chatIdValue.split(',').map((id) => id.trim()).filter(Boolean);
    let allSuccess = true;

    for (const id of chatIds) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: id, text: message, parse_mode: 'HTML' }),
        });

        if (!response.ok) {
          console.error(`Telegram API Error for ID ${id}:`, await response.text());
          allSuccess = false;
        }
      } catch (error) {
        // One unreachable chat must not stop the others.
        console.error(`Telegram request failed for ID ${id}:`, error);
        allSuccess = false;
      }
    }

    return allSuccess;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}
