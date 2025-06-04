import { Context } from 'telegraf';
import User from '../../db/models/User';
import { Markup } from 'telegraf';

export async function statusCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username || `user_${telegramId}`;
  const guideLink = 'https://dkurokhtin.github.io/vpn-docs/#/';

  if (!telegramId) {
    return ctx.reply('❌ Ошибка: не удалось определить ваш Telegram ID');
  }

  const user = await User.findOne({ telegramId });

  if (!user) {
    return ctx.reply('Вы ещё не зарегистрированы. Используйте /start');
  }

  const now = Date.now();
  const expiresAt = user.subscriptionEndsAt?.getTime() || 0;
  const isActive = expiresAt > now;
  
  const statusText = isActive ? '✅ Активна' : '❌ Истекла';
  const expiresAtFormatted = new Date(expiresAt).toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  
  const message = `🔐 *Статус подписки*: ${statusText}` +
                  `📅 Срок действия до: ${expiresAtFormatted}`;
  

  const expiresDate = new Date(expiresAt).toLocaleString('ru-RU');
  const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));

  return ctx.reply(
    `📡 *Личный кабинет*\n\n` +
    `👤 Пользователь: @${username}\n` +
    `🆔 Telegram ID: ${telegramId}\n` +
    `🔐 UUID: \`${user.xrayUuid}\`\n\n` +
    message +
    `📊 Осталось: *${daysLeft} дней*\n` +
    `🔗 Ваша VPN-ссылка:\n\`\`\`\n${user.vpnConfigUrl}\n\`\`\``,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [{text:'🔁 Продлить', callback_data:'extend'}],
        [{ text: '📲 Получить QR-код', callback_data: 'get_qr' }],
        [Markup.button.url('📖 Инструкция', guideLink)]
      ])
    }
  );
}
