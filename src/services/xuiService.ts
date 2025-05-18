import axios from 'axios';
import https from 'https';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';
const XUI_BASE_URL = process.env.XUI_API || 'https://185.242.86.253:2053';

// Вставь cookie из Postman сюда (только значение, без "3x-ui=" и без ; Path=...)
const sessionCookie = '3x-ui=MTc0NzU3Mzc1OHxEWDhFQVFMX2dBQUJFQUVRQUFCMV80QUFBUVp6ZEhKcGJtY01EQUFLVEU5SFNVNWZWVk5GVWhoNExYVnBMMlJoZEdGaVlYTmxMMjF2WkdWc0xsVnpaWExfZ1FNQkFRUlZjMlZ5QWYtQ0FBRUVBUUpKWkFFRUFBRUlWWE5sY201aGJXVUJEQUFCQ0ZCaGMzTjNiM0prQVF3QUFRdE1iMmRwYmxObFkzSmxkQUVNQUFBQVlmLUNYZ0VDQVFwa2EzVnliMnRvZEdsdUFRdE1kbUp1YUdKeE1USXBLQUZBWlVJMWIxRTNjRFJwYzFOeVFqZDJOMmQ0U1VSVU0wSm1UelJzZG5saFRGUTVhMVUyYWxGNk1sbFZUazVxVXpGT1FYUmtWMHN5YjFneVNuaFVPWEpKTXdBPXyLxmqERI0uWz-iIm5VCX2FJ5catn7nEoni3XeEEuxdQg==';

export async function authAndRequest() {
  const api = axios.create({
    baseURL: XUI_BASE_URL,
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    headers: {
      Cookie: sessionCookie
    }
  });

  // Проверим доступ
  const res = await api.get('/dkvpn/panel/api/inbounds/list');
  console.log('🧪 Проверка API: ', res.data);

  return api;
}


export async function disableClientInXui(uuid: string,) {
  const api = await authAndRequest();

  const { data } = await api.get('/dkvpn/panel/api/inbounds/list');
  const inbounds = data.obj;

  const inbound = inbounds.find((inb: any) => {
    const settings = JSON.parse(inb.settings);
    return settings.clients?.some((client: any) => client.id === uuid);
  });

  if (!inbound) throw new Error(`❌ Inbound с UUID ${uuid} не найден`);

  const settings = JSON.parse(inbound.settings);

  const updatedClients = settings.clients.map((client: any) => {
    if (client.id === uuid) {
      return { ...client, enable: false };
    }
    return client;
  });

  const payload = {
    id: 1,
    settings: JSON.stringify({ clients: updatedClients }) 
  };
  logger.info(uuid,updatedClients);
  const response = await api.post(`/dkvpn/panel/api/inbounds/updateClient/${uuid}`, payload);

  if (!response.data.success) {
    throw new Error(`❌ Не удалось отключить клиента: ${response.data.msg}`);
  }

  logger.info(`✅ XUI: клиент ${uuid} отключён`);
}

export async function createVpnClient(uuid: string, remark: string, telegramId: number) {
  const api = await authAndRequest();

  // 1. Получаем список inbound’ов
  const inboundsRes = await api.get('/dkvpn/panel/api/inbounds/list');
  const inbounds = inboundsRes.data?.obj || [];

  // 2. Ищем нужный inbound (vless + reality, порт 443)
  const inbound = inbounds.find(
    (item: any) =>
      item.protocol === 'vless' &&
      String(item.port) === '443' // можешь адаптировать под свой порт
  );

  if (!inbound) {
    throw new Error('❌ Не найден подходящий inbound для добавления клиента.');
  }
  const subscriptionDays = 7;
  const expiryTime = Date.now() + subscriptionDays * 24 * 60 * 60 * 1000;
  
  // 3. Подготавливаем payload
  const payload = {
    id: inbound.id,
    settings: JSON.stringify({
      clients: [
        {
          id: uuid,
          email: remark,
          enable: true,
          expiryTime,
          flow: 'xtls-rprx-vision',
          totalGB: 0,
          tgId: telegramId,
          limitIp: 0
        }
      ]
    })
  };

  // 4. Выполняем запрос
  const res = await api.post('/dkvpn/panel/api/inbounds/addClient', payload);
  logger.info('✅ Добавление клиента:', res.data);

  if (!res.data.success) {
    throw new Error(`❌ Ошибка от XUI: ${res.data.msg}`);
  }

  return res.data;
}

