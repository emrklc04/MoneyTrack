import { convertStoredAmounts } from '@/services/currencyConversionService';
import { getExchangeRate } from '@/services/currencyService';
import type { Transaction } from '@/models/Transaction';

jest.mock('@/services/currencyService', () => ({ getExchangeRate: jest.fn() }));
const mockRate = jest.mocked(getExchangeRate);
const transaction: Transaction = { id: '1', type: 'expense', amount: 10, currency: 'GBP', convertedAmount: 12, categoryId: 'food', date: '2026-11-06', description: 'Test' };
const budget = { id: 'b', categoryId: 'food', monthlyLimit: 100, month: 11, year: 2026 };
afterEach(() => mockRate.mockReset());

it('rechnet gespeicherte Beträge und Budgets gemeinsam um und erhält Originalbeträge', async () => {
  mockRate.mockResolvedValue({ from: 'EUR', to: 'USD', rate: 2, date: '2026-11-06', source: 'live' });
  const result = await convertStoredAmounts([transaction], [budget], 'EUR', 'USD');
  expect(result.transactions[0]).toMatchObject({ amount: 10, currency: 'GBP', convertedAmount: 24 });
  expect(result.budgets[0].monthlyLimit).toBe(200);
  expect(transaction.convertedAmount).toBe(12);
});

it('konvertiert alte Einträge ohne Kurs aus ihrer Originalwährung', async () => {
  mockRate.mockImplementation(async (from, to) => ({ from, to, rate: from === 'GBP' ? 3 : 2, date: '2026-11-06', source: 'cache' }));
  const result = await convertStoredAmounts([{ ...transaction, convertedAmount: undefined }], [budget], 'EUR', 'USD');
  expect(result.transactions[0].convertedAmount).toBe(30);
  expect(result.cached).toBe(true);
});

it('bricht ohne verfügbare Kurse ab und verändert die Eingabedaten nicht', async () => {
  mockRate.mockRejectedValue(new Error('offline'));
  await expect(convertStoredAmounts([transaction], [budget], 'EUR', 'USD')).rejects.toThrow('offline');
  expect(transaction.convertedAmount).toBe(12);
  expect(budget.monthlyLimit).toBe(100);
});

it('verwendet bei der neuen Hauptwährung den exakten Originalbetrag', async () => {
  mockRate.mockResolvedValue({ from: 'EUR', to: 'GBP', rate: 0.8, date: '2026-11-06', source: 'live' });
  const result = await convertStoredAmounts([transaction], [], 'EUR', 'GBP');
  expect(result.transactions[0].convertedAmount).toBe(10);
});
