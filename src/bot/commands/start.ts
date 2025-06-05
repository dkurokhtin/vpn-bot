import { Markup } from 'telegraf';
import { BotContext } from '../context';
import User from '../../db/models/User';
import { v4 as uuidv4 } from 'uuid';
import { createVpnClient } from '../../services/xuiService';
import { VPN_HOST, VPN_PUBLIC_KEY } from '../../config';

import logger from '../../logger';
import { updateMenu } from '../../utils/updateMenu';
import { escapeMarkdown } from '../../utils/escapeMarkdown';
import { statusCommand } from './status';

export async function acceptPolicy(ctx: BotContext) {
  const guideLink = `https://dkurokhtin.github.io/vpn-docs/#/`;
  const telegramId = ctx.from?.id;

  if (!telegramId) return ctx.reply('Ошибка: не удалось получить ваш Telegram ID');

  if (ctx.state.user) {
    if (!ctx.state.user.acceptedPolicy) {
      ctx.state.user.acceptedPolicy = true;
      await ctx.state.user.save();
    }
    return statusCommand(ctx);
  }

  const username = ctx.from?.username || `user_${telegramId}`;
  const uuid = uuidv4();
  const vpnLink = `vless://${uuid}@${VPN_HOST}:443?encryption=none&flow=xtls-rprx-vision&type=tcp&security=reality&fp=chrome&sni=yahoo.com&pbk=${VPN_PUBLIC_KEY}&sid=&spx=%2F#${username}`;

  try {
    await createVpnClient(uuid, username, telegramId);

    await User.create({
      telegramId,
      username,
      balance: 0,
      subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
      xrayUuid: uuid,
      acceptedPolicy: true,
      vpnConfigUrl: vpnLink,
    });

    return updateMenu(
      ctx,
      `👋 Добро пожаловать ${escapeMarkdown(username)}!\n\n` +
        `🗓️ Подписка активна 7 дней.\n\n` +
        `🔗 [Ссылка для подключения, нажмите для копирования](${escapeMarkdown(vpnLink)})\n\n` +
        `\`${escapeMarkdown(vpnLink)}\`\n\n` +
        `📱*Инструкция по подключению*\n\n Для быстрой настройки откройте “Инструкция по подключению” в меню.\n\n` +
        `💡*Что умеет бот?*\n\n` +
        `— Отслеживать статус и срок действия подписки\n\n` +
        `— Продлевать и покупать VPN\n\n` +
        `— Быстро давать ссылку на подключение\n\n` +
        `— Помогать с настройкой\n\n` +
        `— Работать на всех устройствах\n\n` +
        `❗*Важно*: Мы не сохраняем вашу активность и не ведём логи. Dkvpn — кроссплатформенный сервис для безопасного интернета.\n\n` +
        `*Выберите действие в меню ниже:*`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📋 Меню', 'menu')],
          [Markup.button.url('📖 Инструкция по подключению', guideLink)],
        ]),
      { forceNew: true }
    );
  } catch (error: any) {
    logger.error({ err: error }, '❌ Ошибка при создании клиента в XUI');
    return ctx.reply('❌ Не удалось создать VPN-доступ. Обратитесь в поддержку.');
  }
}

export async function startCommand(ctx: BotContext) {
  const privacyLink =
    'https://github.com/dkurokhtin/vpn-docs/blob/main/vpn_legal_docs.md';
  const telegramId = ctx.from?.id;

  if (!telegramId) return ctx.reply('Ошибка: не удалось получить ваш Telegram ID');

  // Всегда отправляем новое приветствие, чтобы пользователь видел ответ внизу чата
  delete (ctx.session as any).menuMessageId;

  try {
    let user = ctx.state.user;

    if (!user) {
      user = await User.findOne({ telegramId });
      if (user) {
        ctx.state.user = user;
      }
    }

    if (user?.acceptedPolicy) {
      await statusCommand(ctx);
      return;
    }
  } catch (err) {
    logger.error({ err }, 'Failed to handle start command');
  }

  const username = ctx.from?.username || `user_${telegramId}`;

  return updateMenu(
    ctx,
    `👋 Добро пожаловать, ${escapeMarkdown(
      username
    )}!\nПеред получением бесплатной 7-дневной подписки ознакомьтесь с нашей политикой конфиденциальности.`,

    Markup.inlineKeyboard([
      [Markup.button.url('📄 Политика конфиденциальности', privacyLink)],
      [Markup.button.callback('✅ Я согласен', 'accept_policy')],
    ])
  );
}
