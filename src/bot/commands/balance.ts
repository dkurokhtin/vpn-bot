import { Markup } from 'telegraf';
import User from '../../db/models/User';
import { updateMenu } from '../../utils/updateMenu';
import { BotContext } from '../context';

export async function balanceCommand(ctx: BotContext) {
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
