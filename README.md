# VPN Telegram Bot

Этот проект — Telegram-бот на Node.js/TypeScript для управления подписками пользователей VPN-сервиса (на базе XUI + Xray).  
Пользователь может получать ссылку на подключение, QR-код, следить за балансом, продлевать подписку и быть уведомлённым о её завершении.

---

## ⚙️ Технологии

- Node.js + TypeScript
- MongoDB + Mongoose
- Telegraf.js
- XUI (панель для Xray)
- pino (логирование)
- QRCode генерация

---

## 📁 Структура проекта

```
src/
├── app.ts                     # запуск бота
├── bot/
│   ├── index.ts               # регистрация всех действий
│   └── commands/              # логика /start, /status, /config и т.д.
├── db/
│   └── models/User.ts         # схема пользователя
├── middleware/
│   └── loadUser.ts            # добавляет user в ctx.state
├── services/
│   ├── xuiService.ts          # XUI API: создание, отключение, продление клиента
│   ├── xuiAuth.ts             # авторизация в панели XUI
│   └── subscriptionCleaner.ts # отключение просроченных подписок
├── utils/
│   ├── sendVpnConfigInfo.ts   # отвечает за вывод ссылки + QR
│   ├── wrapCallbackAction.ts  # безопасная обработка inline-кнопок
│   └── requireUser.ts         # защита команд для незарегистрированных
└── logger.ts                  # логгер через pino
```

---

## 🧠 Основная логика

 - 📦 `/start` — предлагает ознакомиться с политикой конфиденциальности и после согласия выдаёт бесплатную 7‑дневную подписку, создаёт клиента в XUI, сохраняет `xrayUuid` и ссылку

- 📲 `📲 Получить QR-код` — выдаёт текущую ссылку + QR
- 📅 `disableExpiredClients()` — каждые 10 мин проверяет подписки и отключает просроченных
- 💬 Все кнопки (`inline_keyboard`) обрабатываются через `wrapCallbackAction(...)`
- 📋 Пользователь из Mongo доступен как `ctx.state.user` во всех командах

---

## 📌 Переменные окружения (.env)

Пример файла с настройками находится в `.env.example`. Скопируйте его и укажите свои значения.

```env
BOT_TOKEN=<токен Telegram-бота>
MONGODB_URI=mongodb://localhost:27017/vpn-bot
XUI_BASE_URL=https://your-xui-host:port
XUI_USERNAME=admin
XUI_PASSWORD=admin
VPN_HOST=your.vpn.host
VPN_PUBLIC_KEY=...
```

Бот сам выполнит запрос к `/dkvpn/login`, используя `XUI_USERNAME` и
`XUI_PASSWORD`, и сохранит полученное cookie для дальнейших обращений к API.

---

## 🚀 Быстрый запуск

```bash
# Установка зависимостей
npm install

# Запуск бота
npm run start
```

---

## 🧪 Полезные команды

```ts
/forceExpire      — принудительно истекает подписка
/status           — покажет текущую подписку
/config           — выдает VPN-ссылку и QR-код
/extend           — продлить подписку
```

---

## 🛡 TODO (улучшения)

- [ ] Обработка платежей (например, через ЮKassa)
- [ ] Ограничение на количество устройств (по IP)
- [ ] Панель администратора (просмотр юзеров)
- [ ] Webhook-режим вместо polling (опционально)
- [ ] Тесты на логику продления и удаления
