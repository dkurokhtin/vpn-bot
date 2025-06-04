import { Context } from 'telegraf';
import { Markup } from 'telegraf';
import { updateMenu } from '../../utils/updateMenu';

export async function extendCommand(ctx: Context) {
  // Здесь в будущем будет логика оплаты
  return updateMenu(
    ctx,
    '💳 Для продления подписки обратитесь к /оплате или @dkurokhtin.',
    Markup.inlineKeyboard([[Markup.button.callback('🧾 Статус', 'status')]])
  );
}
