import { MiddlewareFn } from 'telegraf';
import { BotContext } from '../context';
import User from '../../db/models/User';
import logger from '../../logger';

export const loadUser: MiddlewareFn<BotContext> = async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return next();

  try {
    const user = await User.findOne({ telegramId });
    if (user) {
      ctx.state.user = user;
      if (user.acceptedPolicy !== true && (user.vpnConfigUrl || user.xrayUuid)) {
        user.acceptedPolicy = true;
        await user.save();
      }
    }
  } catch (err) {
    logger.error({ err }, 'Failed to load user');
  }

  return next();
};
