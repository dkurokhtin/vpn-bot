import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';
import { getAuthenticatedApi } from './xuiAuth';

export async function authAndRequest() {
  const api = await getAuthenticatedApi();
  // Проверим доступ
  await api.get('/dkvpn/panel/api/inbounds/list');
  return api;
}


export async function disableClientInXui(uuid: string) {
  const api = await authAndRequest();

  const { data } = await api.get('/dkvpn/panel/api/inbounds/list');
  const inbounds = data.obj;

  const inbound = inbounds.find((inb: any) => {
    const settings = JSON.parse(inb.settings);
    return settings.clients?.some((client: any) => client.id === uuid);
  });

  if (!inbound) throw new Error(`❌ Inbound с UUID ${uuid} не найден`);

  const settings = JSON.parse(inbound.settings);

  const targetClient = settings.clients.find((client: any) => client.id === uuid);
  if (!targetClient) throw new Error(`❌ Клиент с UUID ${uuid} не найден в inbound`);

  const updatedClient = {
    ...targetClient,
    expiryTime: 0,
    enable: false
  };

  const payload = {
    id: inbound.id, // обязательно использовать правильный inbound
    settings: JSON.stringify({ clients: [updatedClient] }) // ❗️ только один клиент!
  };

  logger.info(`🔧 Отключаем UUID: ${uuid}, inbound ID: ${inbound.id}`);
  logger.debug('📦 Payload:', payload);

  const response = await api.post(`/dkvpn/panel/api/inbounds/updateClient/${uuid}`, payload);
  logger.info(`✅ XUI: клиент ${uuid} отключён`);
  if (!response.data.success) {
    throw new Error(`❌ Не удалось отключить клиента: ${response.data.msg}`);
  }


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

