import { Context } from 'telegraf';

export async function extendCommand(ctx: Context) {
  // Здесь в будущем будет логика оплаты
  return ctx.reply('💳 Для продления подписки обратитесь к /оплате или администратору.');
}
