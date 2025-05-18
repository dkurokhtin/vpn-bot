import { Context } from 'telegraf';
import User from '../../db/models/User';
import { sendVpnConfigInfo } from '../../utils/sendVpnConfigInfo';

export async function qrCommand(ctx: Context) {
  const telegramId = ctx.from?.id;

  if (!telegramId) {
    return ctx.reply('❌ Не удалось определить ваш Telegram ID');
  }

  const user = await User.findOne({ telegramId });

  if (!user) {
    return ctx.reply('❌ Вы ещё не зарегистрированы. Используйте /start');
  }

  return sendVpnConfigInfo(ctx, {
    vpnConfigUrl: user.vpnConfigUrl ?? undefined,
    subscriptionEndsAt: user.subscriptionEndsAt ?? undefined,
    username: user.username || `user_${telegramId}`
  });
}
