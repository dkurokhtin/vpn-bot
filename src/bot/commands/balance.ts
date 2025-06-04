import { Context } from 'telegraf';
import User from '../../db/models/User';
import { Markup } from 'telegraf';
import { updateMenu } from '../../utils/updateMenu';

export async function balanceCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const user = await User.findOne({ telegramId });
  if (!user) return ctx.reply('❌ Вы не зарегистрированы. Нажмите /start');

  return updateMenu(
    ctx,
    `💰 Ваш баланс: ${user.balance} ₽`,
    Markup.inlineKeyboard([[Markup.button.callback('🧾 Статус', 'status')]])
  );
}
