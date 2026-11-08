import { act, render, screen, userEvent } from '@testing-library/react-native';

import { ExchangeRatePreview } from '@/components/ExchangeRatePreview';
import { getExchangeRate, type ExchangeRate } from '@/services/currencyService';

jest.mock('@/services/currencyService', () => ({ getExchangeRate: jest.fn() }));

const mockGetExchangeRate = jest.mocked(getExchangeRate);
const liveRate: ExchangeRate = {
  from: 'USD', to: 'EUR', rate: 0.9, date: '2026-11-06', source: 'live',
};

function pendingRate() {
  let resolve!: (value: ExchangeRate) => void;
  const promise = new Promise<ExchangeRate>((done) => { resolve = done; });
  return { promise, resolve };
}

beforeEach(() => mockGetExchangeRate.mockReset());

it('zeigt den Ladezustand, solange kein Kurs angekommen ist', async () => {
  mockGetExchangeRate.mockReturnValue(pendingRate().promise);
  const onResolved = jest.fn();
  await render(<ExchangeRatePreview from="USD" to="EUR" amount={10} onResolved={onResolved} />);

  expect(screen.getByText('Wechselkurs wird geladen…')).toBeOnTheScreen();
  expect(onResolved).not.toHaveBeenCalled();
});

it('zeigt Kurs, Datum und umgerechneten Betrag nach erfolgreicher Antwort', async () => {
  mockGetExchangeRate.mockResolvedValue(liveRate);
  const onResolved = jest.fn();
  await render(<ExchangeRatePreview from="USD" to="EUR" amount={10} onResolved={onResolved} />);

  expect(await screen.findByText('Wechselkurs erfolgreich geladen')).toBeOnTheScreen();
  expect(screen.getByText('1 USD = 0.9 EUR · Kursdatum: 2026-11-06')).toBeOnTheScreen();
  expect(screen.getByText(/Umgerechnet: 9,00\s*€/)).toBeOnTheScreen();
  expect(screen.queryByText('Wechselkurs wird geladen…')).not.toBeOnTheScreen();
  expect(onResolved).toHaveBeenCalledWith(liveRate);
});

it('kennzeichnet einen gespeicherten Kurs sichtbar als möglicherweise veraltet', async () => {
  mockGetExchangeRate.mockResolvedValue({ ...liveRate, source: 'cache' });
  await render(<ExchangeRatePreview from="USD" to="EUR" amount={10} onResolved={jest.fn()} />);

  expect(await screen.findByText(/Gespeicherter Kurs.*möglicherweise veraltet/)).toBeOnTheScreen();
  expect(screen.queryByText('Wechselkurs erfolgreich geladen')).not.toBeOnTheScreen();
});

it('zeigt bei API-Ausfall einen Fehler und lässt erneutes Laden zu', async () => {
  mockGetExchangeRate.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(liveRate);
  const onResolved = jest.fn();
  const user = userEvent.setup();
  await render(<ExchangeRatePreview from="USD" to="EUR" amount={10} onResolved={onResolved} />);

  expect(await screen.findByRole('alert')).toHaveTextContent(/Kein Wechselkurs verfügbar/);
  expect(onResolved).not.toHaveBeenCalled();
  await user.press(screen.getByRole('button', { name: 'Wechselkurs erneut laden' }));

  expect(await screen.findByText('Wechselkurs erfolgreich geladen')).toBeOnTheScreen();
  expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  expect(onResolved).toHaveBeenNthCalledWith(1, undefined);
  expect(onResolved).toHaveBeenLastCalledWith(liveRate);
});

it('verwirft beim Wiederholen den alten Kurs, bis die neue Anfrage abgeschlossen ist', async () => {
  const nextRequest = pendingRate();
  mockGetExchangeRate.mockResolvedValueOnce(liveRate).mockReturnValueOnce(nextRequest.promise);
  const onResolved = jest.fn();
  const user = userEvent.setup();
  await render(<ExchangeRatePreview from="USD" to="EUR" amount={10} onResolved={onResolved} />);
  await screen.findByText('Wechselkurs erfolgreich geladen');

  await user.press(screen.getByRole('button', { name: 'Wechselkurs erneut laden' }));
  expect(screen.getByText('Wechselkurs wird geladen…')).toBeOnTheScreen();
  expect(screen.queryByText(/Umgerechnet:/)).not.toBeOnTheScreen();
  expect(onResolved).toHaveBeenLastCalledWith(undefined);

  await act(async () => nextRequest.resolve({ ...liveRate, rate: 0.8 }));
  expect(await screen.findByText(/Umgerechnet: 8,00\s*€/)).toBeOnTheScreen();
});

it('aktualisiert die Vorschau bei geändertem Betrag ohne weitere Netzwerkanfrage', async () => {
  mockGetExchangeRate.mockResolvedValue(liveRate);
  const onResolved = jest.fn();
  const view = await render(<ExchangeRatePreview from="USD" to="EUR" amount={10} onResolved={onResolved} />);
  await screen.findByText('Wechselkurs erfolgreich geladen');

  await view.rerender(<ExchangeRatePreview from="USD" to="EUR" amount={20} onResolved={onResolved} />);
  expect(screen.getByText(/Umgerechnet: 18,00\s*€/)).toBeOnTheScreen();
  expect(mockGetExchangeRate).toHaveBeenCalledTimes(1);
});

it('ignoriert eine verspätete Antwort nach dem Verlassen der Ansicht', async () => {
  const request = pendingRate();
  mockGetExchangeRate.mockReturnValue(request.promise);
  const onResolved = jest.fn();
  const view = await render(<ExchangeRatePreview from="USD" to="EUR" amount={10} onResolved={onResolved} />);

  await view.unmount();
  await act(async () => request.resolve(liveRate));
  expect(onResolved).not.toHaveBeenCalled();
});
