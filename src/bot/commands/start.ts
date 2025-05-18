import { Context, Markup } from 'telegraf';
import User from '../../db/models/User';
import { v4 as uuidv4 } from 'uuid';
import { createVpnClient } from '../../services/xuiService';
import logger from '../../logger';
import { disableExpiredClients } from '../../services/disableExpiredClients';

export async function startCommand(ctx: Context) {
  const guideLink = `https://dkurokhtin.github.io/vpn-docs/#/`
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username || `user_${telegramId}`;
  if (!telegramId) return ctx.reply("Ошибка: не удалось получить ваш Telegram ID");

  let user = await User.findOne({ telegramId });
  if (user) {
    
    return ctx.reply(
        `🎉 Добро пожаловать!\n` +
        `🗓️ Подписка активна 7 дней.\n\n` +
        `🔗 Ваша VPN-ссылка:\n` +
        `\`\`\`\n${user.vpnConfigUrl}\n\`\`\``,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('📊 Статус', 'status')],
            [Markup.button.callback('🔁 Продлить подписку', 'extend')],
            [Markup.button.url('📖 Инструкция', guideLink)]
          ])
        }
      );
    
  }

  const uuid = uuidv4();

  try {
    await createVpnClient(uuid, username,telegramId);

    const vpnLink = `vless://${uuid}@${process.env.VPN_HOST}:443?encryption=none&flow=xtls-rprx-vision&type=tcp&security=reality&fp=chrome&sni=yahoo.com&pbk=${process.env.VPN_PUBLIC_KEY}&sid=&spx=%2F#${username}`;

    user = await User.create({
      telegramId,
      username,
      balance: 0,
      subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
      xrayUuid: uuid,
      vpnConfigUrl: vpnLink
    });

    return ctx.reply(
        `🎉 Добро пожаловать!\n` +
        `🗓️ Подписка активна 7 дней.\n\n` +
        `🔗 Ваша VPN-ссылка (скопируйте вручную):\n\`\`\`\n${vpnLink}\n\`\`\`\n\n` +
        `⚙️ Инструкция по подключению для iPhone:\n${guideLink}`,
        { parse_mode: 'Markdown', ...Markup.inlineKeyboard([
            [Markup.button.callback('⚙️ Статус', 'status')],
            [Markup.button.url('📖 Инструкция', guideLink)]
          ])}
      );
  } catch (error: any) {
    logger.error('❌ Ошибка при создании клиента в XUI:', error.message);
    return ctx.reply('❌ Не удалось создать VPN-доступ. Обратитесь в поддержку.');
  }
}
