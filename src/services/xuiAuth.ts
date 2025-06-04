import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { CookieJar } from 'tough-cookie';
import logger from '../logger';

const XUI_BASE_URL = process.env.XUI_BASE_URL || 'https://185.242.86.253:2053';

let apiPromise: Promise<AxiosInstance> | null = null;

async function getApi(): Promise<AxiosInstance> {
  if (!apiPromise) {
    apiPromise = import('axios-cookiejar-support').then(({ wrapper }) => {
      const jar = new CookieJar();
      return wrapper(
        axios.create({
          baseURL: XUI_BASE_URL,
          httpsAgent: new https.Agent({ rejectUnauthorized: false }),
          jar,
          withCredentials: true,
        })
      );
    });
  }
  return apiPromise;
}

let loggedIn = false;

async function login() {
  const username = process.env.XUI_USERNAME;
  const password = process.env.XUI_PASSWORD;

  if (!username || !password) {
    throw new Error('XUI_USERNAME or XUI_PASSWORD is not set');
  }

  logger.info('🔐 Выполняем авторизацию в XUI...');
  try {
    const api = await getApi();
    await api.post('/dkvpn/login', { username, password });
    loggedIn = true;
    logger.info('✅ Авторизация в XUI успешна');
  } catch (err) {
    logger.error({ err }, '❌ Ошибка авторизации в XUI');
    throw err;
  }
}

export async function getAuthenticatedApi() {
  if (!loggedIn) {
    await login();
  }
  return await getApi();
}
