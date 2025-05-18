import { Context } from 'telegraf';
import User from '../../db/models/User';

export async function statusCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const user = await User.findOne({ telegramId });
  if (!user) return ctx.reply('❌ Вы не зарегистрированы. Нажмите /start');
  
  const expires = user.subscriptionEndsAt
  ? user.subscriptionEndsAt.toLocaleDateString()
  : 'не задана';
  
  return ctx.reply(`📅 Подписка активна до: ${expires}`);
}
