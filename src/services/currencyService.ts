const FRANKFURTER_BASE_URL = 'https://api.frankfurter.dev/v1';

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  date: string;
}

export async function getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
  const response = await fetch(`${FRANKFURTER_BASE_URL}/latest?base=${from}&symbols=${to}`);

  if (!response.ok) {
    throw new Error(`Wechselkurs konnte nicht geladen werden: ${response.status}`);
  }

  const data = await response.json();

  return {
    from,
    to,
    rate: data.rates[to],
    date: data.date,
  };
}
