import logger from '../logger';
import { BotContext } from '../bot/context';

export default function wrapCallbackAction(
  handler: (ctx: BotContext) => Promise<any> | void
) {
  return async (ctx: BotContext) => {
    try {
      await ctx.answerCbQuery(); // закрываем "часики"
      await handler(ctx);
    } catch (err) {
      const data =
        ctx.callbackQuery && 'data' in ctx.callbackQuery
          ? ctx.callbackQuery.data
          : 'неизвестно';

      logger.error({ err }, `❌ Ошибка при обработке callback: ${data}`);

      try {
        await ctx.reply('❌ Произошла ошибка при обработке кнопки. Попробуйте снова.');
      } catch (_) {
        // игнорируем повторную ошибку
      }
    }
  };
}
