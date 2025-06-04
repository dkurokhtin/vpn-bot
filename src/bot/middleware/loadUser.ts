import { MiddlewareFn } from 'telegraf';
import { BotContext } from '../context';
import User from '../../db/models/User';


export const loadUser: MiddlewareFn<BotContext> = async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return next();

  const user = await User.findOne({ telegramId });
  if (user) {
    ctx.state.user = user;
    if (user.acceptedPolicy !== true && (user.vpnConfigUrl || user.xrayUuid)) {
      user.acceptedPolicy = true;
      await user.save();
    }
  }

  return next();
};
