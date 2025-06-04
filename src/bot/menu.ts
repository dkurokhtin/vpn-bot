import { Markup } from 'telegraf';

export const guideLink = 'https://dkurokhtin.github.io/vpn-docs/#/';

export function mainMenu() {
  return Markup.inlineKeyboard([
    [{ text: '🧾 Статус', callback_data: 'status' }],
    [{ text: '📲 Получить QR-код', callback_data: 'get_qr' }],
    [{ text: '🔁 Продлить подписку', callback_data: 'extend' }],
    [Markup.button.url('📖 Инструкция', guideLink)]
  ]);
}
