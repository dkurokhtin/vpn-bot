import { Markup } from 'telegraf';
import { BotContext } from '../bot/context';

export async function updateMenu(
  ctx: BotContext,
  text: string,
  keyboard: ReturnType<typeof Markup.inlineKeyboard>,
  options?: { forceNew?: boolean }
) {
  const forceNew = options?.forceNew;
  const extra = { parse_mode: 'Markdown', reply_markup: keyboard.reply_markup } as any;
  const chatId = ctx.chat?.id;
  const storedId = (ctx.session as any)?.menuMessageId;

  if (forceNew) {
    if (chatId) {
      const msg = await ctx.telegram.sendMessage(chatId, text, extra);
      (ctx.session as any).menuMessageId = msg.message_id;
    } else {
      await ctx.reply(text, extra);
    }
    return;
  }

  if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
    try {
      await ctx.editMessageText(text, extra);
      (ctx.session as any).menuMessageId = ctx.callbackQuery.message.message_id;
      return;
    } catch (err: any) {
      if (err.description?.includes('message is not modified')) {
        // try to update the keyboard even if text didn't change
        try {
          await ctx.editMessageReplyMarkup(extra.reply_markup);
          (ctx.session as any).menuMessageId = ctx.callbackQuery.message.message_id;
          return;
        } catch (err2: any) {
          // Ignore if nothing changed
          if (err2.description?.includes('message is not modified')) {
            return;
          }
        }
      }
      // remove invalid stored message id so we can send a fresh message
      delete (ctx.session as any).menuMessageId;
    }
  }

  if (chatId && storedId) {
    try {
      await ctx.telegram.editMessageText(chatId, storedId, undefined, text, extra);
      return;
    } catch (err: any) {
      if (err.description?.includes('message is not modified')) {
        // update keyboard when text stays the same
        try {
          await ctx.telegram.editMessageReplyMarkup(chatId, storedId, undefined, extra.reply_markup);
          return;
        } catch (err2: any) {
          if (err2.description?.includes('message is not modified')) {
            return;
          }
        }
      }
      // If the message wasn't modified, still send a new one for convenience
      if (!err.description?.includes('message is not modified')) {
        delete (ctx.session as any).menuMessageId;
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
