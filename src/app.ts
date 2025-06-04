import logger from './logger';

import './db';
import './bot';
import { disableExpiredClients } from './services/disableExpiredClients';

setInterval(disableExpiredClients, 1000 * 60 * 10); // каждые 10 минут

logger.info('🕒 Проверка подписок будет выполняться каждые 10 минут');
