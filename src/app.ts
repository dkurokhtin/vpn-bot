import logger from './logger';

import { connectDb } from './db';
import { launchBot } from './bot';
import { disableExpiredClients } from './services/disableExpiredClients';
import { notifyPolicyToUsers } from './services/notifyPolicy';
import { warmupXuiApi } from './services/xuiAuth';

async function init() {
  await connectDb();
  await launchBot();

  setInterval(disableExpiredClients, 1000 * 60 * 10); // каждые 10 минут
  logger.info('🕒 Проверка подписок будет выполняться каждые 10 минут');
  notifyPolicyToUsers().catch(() => {});
  warmupXuiApi().catch(() => {});
}

init().catch((err) => {
  logger.error({ err }, 'Failed to initialize application');
});
