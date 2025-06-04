import { Context, Markup } from 'telegraf';
import User from '../../db/models/User';
import { v4 as uuidv4 } from 'uuid';
import { createVpnClient } from '../../services/xuiService';

import logger from '../../logger';
import { disableExpiredClients } from '../../services/disableExpiredClients';

export async function startCommand(ctx: Context) {
  const guideLink = `https://dkurokhtin.github.io/vpn-docs/#/`
  const uuid = uuidv4();
  const {user} = ctx.state;
  const {subscriptionEndsAt,telegramId} = user;
  const {username} = ctx.state.user || `user_${telegramId}`;

  if (!telegramId) return ctx.reply("Ошибка: не удалось получить ваш Telegram ID");


  const now = Date.now();
  const expiresAt = subscriptionEndsAt?.getTime() || 0;
  const isActive = expiresAt > now;
  
  const statusText = isActive ? '✅ Активна' : '❌ Истекла';
  const expiresAtFormatted = new Date(expiresAt).toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const expiresDate = new Date(expiresAt).toLocaleString('ru-RU');
  const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
  const message = `🔐 *Статус подписки*: ${statusText}`;
  const vpnLink = `vless://${uuid}@${process.env.VPN_HOST}:443?encryption=none&flow=xtls-rprx-vision&type=tcp&security=reality&fp=chrome&sni=yahoo.com&pbk=${process.env.VPN_PUBLIC_KEY}&sid=&spx=%2F#${username}`;
  if (user) {
    
    // return ctx.reply(
    //   `🎉 Добро пожаловать ${username}!\n` +
    //   `🗓️ Подписка активна ${daysLeft} дней.\n\n` +
    //   `📅 Срок действия до: ${expiresAtFormatted}` +
    //   `${message} \n` +
    //   `🔗 Ваша VPN-ссылка:\n\`${vpnLink}\``,
    //   {
    //     parse_mode: 'MarkdownV2',
    //     reply_markup: {
    //       inline_keyboard: [
    //         [{ text: '⚙️ Статус', callback_data: 'status' }],
    //         [{ text: '📖 Инструкция по подключению', url: guideLink }]
    //       ]
    //     }
    //   }
    // )
      
    return ctx.telegram.sendMessage(telegramId,"тест")
    
  }



  try {
    await createVpnClient(uuid, username,telegramId);

    

   const user = await User.create({
      telegramId,
      username,
      balance: 0,
      subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
      xrayUuid: uuid,
      vpnConfigUrl: vpnLink
    });


    return ctx.reply(
        `🎉 Добро пожаловать ${username}!\n` +
        `🗓️ Подписка активна  дней.\n\n` +
        `🔗 Ваша VPN-ссылка:\`\`\`\n${vpnLink}\n\`\`\`\n`,
        Markup.inlineKeyboard([
            [Markup.button.callback('⚙️ Статус', 'status')],
            [Markup.button.url('📖 Инструкция по подключению', guideLink)]
          ]))
      
  } catch (error: any) {
    logger.error('❌ Ошибка при создании клиента в XUI:', error.message);
    return ctx.reply('❌ Не удалось создать VPN-доступ. Обратитесь в поддержку.');
  }
}
