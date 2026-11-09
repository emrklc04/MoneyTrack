import { getExchangeRate } from '@/services/currencyService';
const mockCacheRate = jest.fn().mockResolvedValue(undefined);
const mockGetCachedRate = jest.fn();

jest.mock('@/database/database', () => ({
  cacheRate: (...args: unknown[]) => mockCacheRate(...args),
  getCachedRate: (...args: unknown[]) => mockGetCachedRate(...args),
}));


process.env.EXPO_PUBLIC_EXCHANGE_API_URL = 'https://api.frankfurter.dev/v1';

const originalFetch = global.fetch;
beforeEach(() => { mockGetCachedRate.mockResolvedValue(null); });

afterEach(() => {
  global.fetch = originalFetch;
  mockCacheRate.mockClear();
  mockGetCachedRate.mockReset();
});

describe('getExchangeRate', () => {
  it('liefert Kurs 1 bei gleicher Währung ohne API-Aufruf', async () => {
    global.fetch = jest.fn();
    const result = await getExchangeRate('EUR', 'EUR');
    expect(result.rate).toBe(1);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('lädt den Kurs von der API und cached ihn', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ date: '2026-10-08', rates: { EUR: 0.9 } }),
    });
    const result = await getExchangeRate('USD', 'EUR');
    expect(result).toEqual({ from: 'USD', to: 'EUR', rate: 0.9, date: '2026-10-08', source: 'live' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/latest?base=USD&symbols=EUR'),
      expect.objectContaining({
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store' },
      }),
    );
    expect(mockCacheRate).toHaveBeenCalledWith('USD_EUR', 0.9, '2026-10-08');
  });

  it('nutzt offline den gecachten Kurs', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));
    mockGetCachedRate.mockResolvedValue({ rate: 0.88, date: '2026-10-01' });
    const result = await getExchangeRate('USD', 'EUR');
    expect(result.rate).toBe(0.88);
  });

  it('wirft einen Fehler, wenn weder API noch Cache verfügbar sind', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));
    mockGetCachedRate.mockResolvedValue(null);
    await expect(getExchangeRate('USD', 'EUR')).rejects.toThrow();
  });
});


describe('Wechselkurs-Validierung', () => {
  it.each([0, -1, NaN, Infinity, '0.9', undefined])('verwirft ungültigen Kurs %s', async (rate) => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ date: '2026-11-06', rates: { EUR: rate } }) });
    await expect(getExchangeRate('USD', 'EUR')).rejects.toThrow();
    expect(mockCacheRate).not.toHaveBeenCalled();
  });
  it('kennzeichnet den Offline-Cache', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    mockGetCachedRate.mockResolvedValue({ rate: 0.9, date: '2026-11-06' });
    await expect(getExchangeRate('USD', 'EUR')).resolves.toMatchObject({ source: 'cache', date: '2026-11-06' });
  });
  it('nutzt Cache bei HTTP-Fehlern', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
    mockGetCachedRate.mockResolvedValue({ rate: 0.9, date: '2026-11-06' });
    await expect(getExchangeRate('USD', 'EUR')).resolves.toMatchObject({ source: 'cache' });
  });
  it('bricht eine hängende Anfrage nach zehn Sekunden ab', async () => {
    jest.useFakeTimers();
    try {
      global.fetch = jest.fn().mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('timeout')));
      }));
      const expectation = expect(getExchangeRate('USD', 'EUR')).rejects.toThrow('timeout');
      await jest.advanceTimersByTimeAsync(10000);
      await expectation;
    } finally { jest.useRealTimers(); }
  });
});
