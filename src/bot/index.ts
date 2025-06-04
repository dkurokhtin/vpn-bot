import { Telegraf } from 'telegraf';
import { BotContext } from './context';
import dotenv from 'dotenv';
import { startCommand } from './commands/start';
import { statusCommand } from './commands/status';
import { balanceCommand } from './commands/balance';
import { qrCommand } from './commands/qr';
import { extendCommand } from './commands/extend';
import logger from '../logger';
import wrapCallbackAction from '../utils/wrapCallbackAction';
import { configCommand } from './commands/config';
import { loadUser } from './middleware/loadUser';
import mongoose from 'mongoose';
import { mongooseSession } from '../session';

export function registerActions(bot: Telegraf<BotContext>) {

    bot.action('status', wrapCallbackAction(statusCommand));
    bot.action('extend', wrapCallbackAction(extendCommand));
    bot.action('get_qr', wrapCallbackAction(qrCommand));
  }
dotenv.config();
export const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN!);
mongoose.connect(process.env.MONGODB_URI!, {
  dbName: 'vpn-bot',
});
bot.use(mongooseSession);
 // Лог всех входящих апдейтов (сообщения, команды, кнопки)
bot.use((ctx, next) => {
    const user = ctx.from?.username || `ID:${ctx.from?.id}`;
    const type = ctx.updateType;
  
    let data = '[неизвестно]';
  
    if (type === 'message' && 'text' in ctx.message!) {
      data = ctx.message.text;
    }
  
    if (type === 'callback_query' && 'data' in ctx.callbackQuery!) {
      data = `callback:${ctx.callbackQuery.data}`;
    }
  
    logger.info(`📨 [${type}] от ${user}: ${data}`);
  
    return next();
  });
bot.use(loadUser);
// ✅ Команды
bot.start(startCommand);
bot.command('get_qr',qrCommand);
bot.command('terms', (ctx) =>
  ctx.reply('📄 Ознакомьтесь с условиями использования сервиса и политикой конфиденциальности:\n\nhttps://github.com/dkurokhtin/vpn-docs/blob/main/vpn_legal_docs.md')
);
bot.command('status', statusCommand);
bot.command('balance', balanceCommand);
bot.command('config', configCommand);
bot.command('extend', extendCommand);

// ✅ Callback-кнопки с обёрткой
registerActions(bot);

// ✅ Запуск
bot.launch().then(() => logger.info('🚀 Бот запущен'));

// ✅ Глобальный перехват ошибок
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, '🔥 [unhandledRejection]');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, '💥 [uncaughtException]');
});
