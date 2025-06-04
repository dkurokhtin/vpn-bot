import { Context } from 'telegraf';
import QRCode from 'qrcode';
import { mainMenu, guideLink } from '../bot/menu';

export async function sendVpnConfigInfo(
    ctx: Context,
    user: {
      vpnConfigUrl?: string | null;
      username?: string | null;
      subscriptionEndsAt?: Date | null;
    }
  ) {
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
  await ctx.reply(
    `🔗 *Ссылка для подключения:*\n\`\`\`\n${vpnUrl}\n\`\`\``,
    {
      parse_mode: 'Markdown',
      ...mainMenu()
    }
  );


}
