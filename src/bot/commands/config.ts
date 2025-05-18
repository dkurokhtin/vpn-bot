import { Context } from 'telegraf';
import User from '../../db/models/User';

export async function configCommand(ctx: Context) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const user = await User.findOne({ telegramId });
  if (!user) return ctx.reply('❌ Вы не зарегистрированы. Нажмите /start');

  if (!user.vpnConfigUrl) {
    return ctx.reply('⚠️ Конфигурация VPN ещё не выдана. Обратитесь в поддержку.');
  }

  return ctx.reply(`🔗 Ваша конфигурация VPN:\n${user.vpnConfigUrl}`);
}
