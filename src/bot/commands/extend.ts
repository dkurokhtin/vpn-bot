import { Markup } from 'telegraf';
import { updateMenu } from '../../utils/updateMenu';
import { BotContext } from '../context';

export async function extendCommand(ctx: BotContext) {
  // Здесь в будущем будет логика оплаты
  return updateMenu(
    ctx,
    '💳 Для продления подписки обратитесь к /оплате или @dkurokhtin.',
    Markup.inlineKeyboard([[Markup.button.callback('🧾 Статус', 'status')]])
  );
}
