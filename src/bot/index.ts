import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { startCommand } from './commands/start';
import { statusCommand } from './commands/status';
import { balanceCommand } from './commands/balance';
import { qrCommand } from './commands/qr';




import { extendCommand } from './commands/extend';
import { mainMenu } from './menu';

import logger from '../logger';
import wrapCallbackAction from '../utils/wrapCallbackAction';
import { configCommand } from './commands/config';

export function registerActions(bot: Telegraf<any>) {
    // регистрируем действие на кнопку "📲 Получить QR-код"
    bot.action('status', wrapCallbackAction(statusCommand));
    bot.action('extend', wrapCallbackAction(extendCommand));
    bot.action('get_qr', wrapCallbackAction(qrCommand));
  }
dotenv.config();
export const bot = new Telegraf(process.env.BOT_TOKEN!);
bot.telegram.setMyCommands([
  { command: 'start', description: 'Начать работу' },
  { command: 'status', description: 'Статус подписки' },
  { command: 'get_qr', description: 'Получить QR-код' },
  { command: 'config', description: 'Получить конфиг' },
  { command: 'extend', description: 'Продлить подписку' },
  { command: 'balance', description: 'Баланс' }
]);

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

// ✅ Команды
bot.start(startCommand);
bot.command('get_qr',qrCommand);
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
