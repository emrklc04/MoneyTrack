export function getExchangeApiUrl(): string {
  const value = process.env.EXPO_PUBLIC_EXCHANGE_API_URL;
  if (!value || !value.startsWith('https://')) {
    throw new Error('API-Konfiguration fehlt: EXPO_PUBLIC_EXCHANGE_API_URL in .env prüfen.');
  }
  return value.replace(/\/+$/, '');
}
