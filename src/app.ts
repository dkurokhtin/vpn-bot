import dotenv from 'dotenv';
import logger from './logger';
dotenv.config();

import './db';
import './bot';
import { disableExpiredClients } from './services/disableExpiredClients';
disableExpiredClients();
setInterval(disableExpiredClients, 1000 * 60 * 10); // каждые 10 минут

logger.info('🕒 Проверка подписок будет выполняться каждые 10 минут');