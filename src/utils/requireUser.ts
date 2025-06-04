import { MiddlewareFn } from 'telegraf';
import { BotContext } from '../bot/context';


export function requireUser(handler: MiddlewareFn<BotContext>) {
    return async (ctx: BotContext, next: any) => {
      if (!ctx.state.user) {
        return ctx.reply('❌ Сначала используйте /start');
      }
      return handler(ctx, next);
    };
  }
  