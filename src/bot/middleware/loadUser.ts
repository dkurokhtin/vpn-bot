import { Context, MiddlewareFn } from 'telegraf';
import User from '../../db/models/User';


export const loadUser: MiddlewareFn<Context> = async (ctx, next) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return next();

  const user = await User.findOne({ telegramId });
  if (user) {
    ctx.state.user = user;
  }

  return next();
};
