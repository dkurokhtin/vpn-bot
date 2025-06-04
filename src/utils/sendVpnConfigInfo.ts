import { Markup } from 'telegraf';
import QRCode from 'qrcode';
import { updateMenu } from './updateMenu';
import { escapeMarkdown } from './escapeMarkdown';
import { BotContext } from '../bot/context';

export async function sendVpnConfigInfo(
    ctx: BotContext,
    user: {
      vpnConfigUrl?: string | null;
      username?: string | null;
      subscriptionEndsAt?: Date | null;
    }
  ) {
  const guideLink = 'https://dkurokhtin.github.io/vpn-docs/#/';
  const vpnUrl = user.vpnConfigUrl;

  if (!vpnUrl) {
    return ctx.reply('❌ Не удалось найти VPN-ссылку для вашего аккаунта');
  }

  // ✅ Генерация QR по ссылке
  const qrBuffer = await QRCode.toBuffer(vpnUrl, {
    width: 300,
    margin: 1
  });
  
  await ctx.replyWithPhoto({ source: qrBuffer }, {
    caption: '📲 Отсканируйте QR-код для подключения'
  });
  await updateMenu(
    ctx,
    `🔗 [Ссылка для подключения](${escapeMarkdown(vpnUrl)})`,
    Markup.inlineKeyboard([
      [{ text: '🧾 Статус', callback_data: 'status' }],
      [{ text: '📲 Получить QR-код', callback_data: 'get_qr' }],
      [{ text: '📖 Инструкция по подключению', url: guideLink }]
    ])
  );


}
