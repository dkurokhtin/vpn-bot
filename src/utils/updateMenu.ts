import { Context, Markup } from 'telegraf';

export async function updateMenu(
  ctx: Context,
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
    } catch (_) {}
  }

  if (chatId && storedId) {
    try {
      await ctx.telegram.editMessageText(chatId, storedId, undefined, text, extra);
      return;
    } catch (_) {}
  }

  if (chatId) {
    const msg = await ctx.telegram.sendMessage(chatId, text, extra);
    (ctx.session as any).menuMessageId = msg.message_id;
  } else {
    await ctx.reply(text, extra);
  }
}
