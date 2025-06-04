import User from '../db/models/User';
import logger from '../logger';
import { bot } from '../bot';
import { Markup } from 'telegraf';

export async function notifyPolicyToUsers() {
  const privacyLink =
    'https://github.com/dkurokhtin/vpn-docs/blob/main/vpn_legal_docs.md';

  const users = await User.find({ acceptedPolicy: { $ne: true } });
  logger.info(`🔔 Напоминание о политике для ${users.length} пользователей`);

  for (const user of users) {
    if (!user.telegramId) continue;
    try {
      await bot.telegram.sendMessage(
        user.telegramId,
        '📄 Пожалуйста, ознакомьтесь с нашей политикой конфиденциальности',
        {
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.url('📄 Политика конфиденциальности', privacyLink)],
            [Markup.button.callback('✅ Я согласен', 'accept_policy')]
          ]).reply_markup,
          parse_mode: 'Markdown'
        }
      );
    } catch (err) {
      logger.error({ err }, `❌ Ошибка отправки политики ${user.telegramId}`);
    }
  }
}
