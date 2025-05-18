import { Context } from 'telegraf';
import User from '../../db/models/User';

export async function balanceCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const user = await User.findOne({ telegramId });
  if (!user) return ctx.reply('❌ Вы не зарегистрированы. Нажмите /start');

  return ctx.reply(`💰 Ваш баланс: ${user.balance} ₽`);
}
