import { Markup } from 'telegraf';
import { BotContext } from '../context';
import User from '../../db/models/User';
import { v4 as uuidv4 } from 'uuid';
import { createVpnClient } from '../../services/xuiService';

import logger from '../../logger';
import { updateMenu } from '../../utils/updateMenu';
import { statusCommand } from './status';

export async function startCommand(ctx: BotContext) {
  const guideLink = `https://dkurokhtin.github.io/vpn-docs/#/`;
  const telegramId = ctx.from?.id;

  if (!telegramId) return ctx.reply('Ошибка: не удалось получить ваш Telegram ID');

  if (ctx.state.user) {
    return statusCommand(ctx);
  }

  const username = ctx.from?.username || `user_${telegramId}`;
  const uuid = uuidv4();
  const vpnLink = `vless://${uuid}@${process.env.VPN_HOST}:443?encryption=none&flow=xtls-rprx-vision&type=tcp&security=reality&fp=chrome&sni=yahoo.com&pbk=${process.env.VPN_PUBLIC_KEY}&sid=&spx=%2F#${username}`;



    try {
      await createVpnClient(uuid, username, telegramId);

     const user = await User.create({
        telegramId,
        username,
        balance: 0,
        subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
        xrayUuid: uuid,
        vpnConfigUrl: vpnLink
      });

      return updateMenu(
        ctx,
        `🎉 Добро пожаловать ${username}!\n` +
          `🗓️ Подписка активна 7 дней.\n\n` +
          `🔗 Ваша VPN-ссылка:\n\`\`\`\n${vpnLink}\n\`\`\`\n`,
        Markup.inlineKeyboard([
          [Markup.button.callback('⚙️ Статус', 'status')],
          [Markup.button.url('📖 Инструкция по подключению', guideLink)]
        ])
      );
      
  } catch (error: any) {
    logger.error('❌ Ошибка при создании клиента в XUI:', error.message);
    return ctx.reply('❌ Не удалось создать VPN-доступ. Обратитесь в поддержку.');
  }
}
