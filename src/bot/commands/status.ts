import { Markup } from 'telegraf';
import User from '../../db/models/User';
import { updateMenu } from '../../utils/updateMenu';
import { escapeMarkdown } from '../../utils/escapeMarkdown';
import { BotContext } from '../context';
import logger from '../../logger';

export async function statusCommand(ctx: BotContext) {
  const telegramId = ctx.from?.id;
  const username = ctx.from?.username || `user_${telegramId}`;
  const guideLink = 'https://dkurokhtin.github.io/vpn-docs/#/';

  if (!telegramId) {
    return ctx.reply('❌ Ошибка: не удалось определить ваш Telegram ID');
  }

  let user;
  try {
    user = await User.findOne({ telegramId });
  } catch (err) {
    logger.error({ err }, 'Failed to load user for status');
    return ctx.reply('❌ Не удалось получить данные пользователя. Попробуйте позднее.');
  }

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
  
  const message =
    `🔐 *Статус подписки*: ${statusText}\n` +
    `📅 Срок действия до: ${escapeMarkdown(expiresAtFormatted)}\n`;
  const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));

  return updateMenu(
    ctx,
    `📡 *Личный кабинет*\n\n` +
      `👤 Пользователь: @${escapeMarkdown(username)}\n` +
      `🆔 Telegram ID: ${telegramId}\n` +
      `🔐 UUID: \`${user.xrayUuid}\`\n\n` +
      message +
      `📊 Осталось: *${daysLeft} дней*\n` +
      `🔗 [Ссылка для подключения](${escapeMarkdown(user.vpnConfigUrl ?? '')})`,
    Markup.inlineKeyboard([
      [{ text: '🧾 Статус', callback_data: 'status' }],
      [{ text: '🔁 Продлить', callback_data: 'extend' }],
      [{ text: '📲 Получить QR-код', callback_data: 'get_qr' }],
      [Markup.button.url('📖 Инструкция', guideLink)]
    ])
  );
}
