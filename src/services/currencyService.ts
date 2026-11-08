import { getExchangeApiUrl } from '@/config/environment';

import { cacheRate, getCachedRate } from '@/database/database';


export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  source: 'live' | 'cache' | 'identity';
  date: string;
}

export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'TRY'] as const;

export async function getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
  if (from === to) {
    return { from, to, rate: 1, source: 'identity', date: new Date().toISOString().slice(0, 10) };
  }

  const pair = `${from}_${to}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(
      `${getExchangeApiUrl()}/latest?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`,
      // Bypass the transport cache so offline data comes from our dated SQLite cache.
      { signal: controller.signal, cache: 'no-store' },
    );

    if (!response.ok) {
      throw new Error(`Wechselkurs konnte nicht geladen werden: ${response.status}`);
    }

    const data = await response.json();
    const rate = data?.rates?.[to];
    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0 || typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error(`Kein Wechselkurs für ${from} → ${to} verfügbar`);
    }

    await cacheRate(pair, rate, data.date).catch(() => undefined);
    return { from, to, rate, date: data.date, source: 'live' };
  } catch (error) {
    const cached = await getCachedRate(pair).catch(() => null);
    if (cached && Number.isFinite(cached.rate) && cached.rate > 0) {
      return { from, to, rate: cached.rate, date: cached.date, source: 'cache' };
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
