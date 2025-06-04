import User from '../../db/models/User';
import { sendVpnConfigInfo } from '../../utils/sendVpnConfigInfo';
import { BotContext } from '../context';

export async function configCommand(ctx: BotContext) {
  const telegramId = ctx.from?.id;

  if (!telegramId) {
    return ctx.reply('❌ Не удалось определить ваш Telegram ID');
  }

  const user = await User.findOne({ telegramId });

  if (!user) {
    return ctx.reply('❌ Вы ещё не зарегистрированы. Используйте /start');
  }

  return sendVpnConfigInfo(ctx, user);
}
