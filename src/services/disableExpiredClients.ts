import User from '../db/models/User';
import { disableClientInXui } from './xuiService';
import logger from '../logger';
import { bot } from '../bot';

export async function disableExpiredClients() {
  const now = new Date();
  logger.info('🔍 Проверка истекших подписок...');
  const expiredUsers = await User.find({
    subscriptionEndsAt: { $lt: now },
    disabled: { $ne: true },
    notifiedExpired: { $ne: true }
  });
  logger.info(`🔎 Найдено ${expiredUsers.length} пользователей с истекшей подпиской`);
  for (const user of expiredUsers) {
    try {
      if (!user.xrayUuid) {
        logger.warn(`⚠️ Нет Xray UUID у ${user.username}, пропускаем отключение`);
        continue;
      }

      await disableClientInXui(user.xrayUuid);

      user.disabled = true;
      user.notifiedExpired = true;
      await user.save();

      logger.info(`⛔ VPN отключён для ${user.username}`);

      if (!user.telegramId) {
        logger.warn(`⚠️ Нет Telegram ID у ${user.username}, уведомление не отправлено`);
        continue;
      }
      logger.info(`📨 Отправляем уведомление Telegram ID ${user.telegramId}`);
      await bot.telegram.sendMessage(
        user.telegramId,
        `❌ *Подписка завершена*\n\nВаш VPN-доступ временно приостановлен. Чтобы восстановить доступ — нажмите кнопку ниже.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔁 Продлить подписку', callback_data: 'extend' }]
            ]
          }
        }
      );
    } catch (err) {
      logger.error({ err }, `❌ Ошибка при отключении ${user.username}`);
    }
  }
}
