import { Markup } from 'telegraf';
import { BotContext } from '../bot/context';

export async function updateMenu(
  ctx: BotContext,
  text: string,
  keyboard: ReturnType<typeof Markup.inlineKeyboard>
) {
  const extra = { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup } as any;
  const chatId = ctx.chat?.id;
  const storedId = (ctx.session as any)?.menuMessageId;

  if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
    try {
      await ctx.editMessageText(text, extra);
      (ctx.session as any).menuMessageId = ctx.callbackQuery.message.message_id;
      return;
    } catch (err: any) {
      // Ignore "message is not modified" errors to avoid sending duplicate menus
      if (err.description?.includes('message is not modified')) {
        return;
      }
    }
  }

  if (chatId && storedId) {
    try {
      await ctx.telegram.editMessageText(chatId, storedId, undefined, text, extra);
      return;
    } catch (err: any) {
      if (err.description?.includes('message is not modified')) {
        return;
      }
    }
  }

  if (chatId) {
    const msg = await ctx.telegram.sendMessage(chatId, text, extra);
    (ctx.session as any).menuMessageId = msg.message_id;
  } else {
    await ctx.reply(text, extra);
  }
}
