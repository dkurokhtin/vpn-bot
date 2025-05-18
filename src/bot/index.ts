import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { startCommand } from './commands/start';
import { statusCommand } from './commands/status';
import { balanceCommand } from './commands/balance';
import { configCommand } from './commands/config';
import { extendCommand } from './commands/extend';

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.start(startCommand);
bot.command('status', statusCommand);
bot.command('balance', balanceCommand);
bot.command('config', configCommand);
bot.command('extend', extendCommand);

bot.launch().then(() => console.log('🚀 Бот запущен'));
