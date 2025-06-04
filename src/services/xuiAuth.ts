import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { HttpCookieAgent, HttpsCookieAgent } from 'http-cookie-agent/http';
import { CookieJar } from 'tough-cookie';
import logger from '../logger';
import { XUI_BASE_URL, XUI_USERNAME, XUI_PASSWORD } from '../config';


let apiPromise: Promise<AxiosInstance> | null = null;

function createApi(): AxiosInstance {
  const jar = new CookieJar();

  const instance = axios.create({
    baseURL: XUI_BASE_URL,
    httpAgent: new HttpCookieAgent({ cookies: { jar } }),
    httpsAgent: new HttpsCookieAgent({ cookies: { jar }, rejectUnauthorized: false }),
    withCredentials: true,
    timeout: 5000
  });

  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
  });

  return instance;
}

async function getApi(): Promise<AxiosInstance> {
  if (!apiPromise) {
    apiPromise = Promise.resolve(createApi());
  }
  return apiPromise;
}

let loggedIn = false;

async function login() {
  const username = XUI_USERNAME;
  const password = XUI_PASSWORD;

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

// Выполняем логин при старте приложения, чтобы прогреть API
export async function warmupXuiApi(): Promise<void> {
  try {
    await login();
  } catch (err) {
    logger.warn({ err }, '⚠️ Не удалось прогреть XUI API при старте');
  }
}
