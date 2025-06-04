import { Context } from 'telegraf';
import User from '../../db/models/User';
import { mainMenu, guideLink } from '../menu';

export async function statusCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username || `user_${telegramId}`;

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

  const expiresDate = new Date(expiresAt).toLocaleString('ru-RU');
  const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));

  return ctx.reply(
    `📡 *Статус подписки*\n\n` +
    `👤 Пользователь: @${username}\n` +
    `🆔 Telegram ID: ${telegramId}\n` +
    `🔐 UUID: \`${user.xrayUuid}\`\n\n` +
    `📆 До: *${expiresDate}*\n` +
    `📊 Осталось: *${daysLeft} дней*\n` +
    `🧾 Статус: *${statusText}*\n\n` +
    `🔗 Ваша VPN-ссылка:\n\`\`\`\n${user.vpnConfigUrl}\n\`\`\``,
    {
      parse_mode: 'Markdown',
      ...mainMenu()
    }
  );
}
