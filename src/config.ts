import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set. Please update your .env configuration.`);
    process.exit(1);
  }
  return value;
}

export const BOT_TOKEN = requireEnv('BOT_TOKEN');
export const MONGODB_URI = requireEnv('MONGODB_URI');
export const VPN_HOST = requireEnv('VPN_HOST');
export const VPN_PUBLIC_KEY = requireEnv('VPN_PUBLIC_KEY');
export const XUI_BASE_URL = process.env.XUI_BASE_URL || 'https://185.242.86.253:2053';
export const XUI_USERNAME = requireEnv('XUI_USERNAME');
export const XUI_PASSWORD = requireEnv('XUI_PASSWORD');
