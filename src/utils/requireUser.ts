import { Context, MiddlewareFn } from 'telegraf';


export function requireUser(handler: MiddlewareFn<Context>) {
    return async (ctx:Context, next:any) => {
      if (!ctx.state.user) {
        return ctx.reply('❌ Сначала используйте /start');
      }
      return handler(ctx, next);
    };
  }
  