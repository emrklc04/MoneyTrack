import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { getExchangeRate, type ExchangeRate } from '@/services/currencyService';
import { formatCurrency } from '@/utils/formatCurrency';

type Props = { from: string; to: string; amount: number; onResolved: (rate: ExchangeRate | undefined) => void };

function Request({ from, to, amount, onResolved }: Props) {
  const [result, setResult] = useState<ExchangeRate>();
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getExchangeRate(from, to).then((rate) => {
      if (active) { setResult(rate); onResolved(rate); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [from, to, onResolved]);

  if (error) return <ThemedText accessibilityRole="alert">Kein Wechselkurs verfügbar. Prüfe deine Verbindung und versuche es erneut. Ohne Kurs kann diese Fremdwährung nicht gespeichert werden.</ThemedText>;
  if (!result) return <View><ActivityIndicator /><ThemedText>Wechselkurs wird geladen…</ThemedText></View>;
  return <View accessibilityLiveRegion="polite">
    <ThemedText>1 {from} = {result.rate} {to} · Kursdatum: {result.date}</ThemedText>
    <ThemedText>{result.source === 'cache' ? 'Gespeicherter Kurs (API nicht erreichbar; möglicherweise veraltet)' : 'Wechselkurs erfolgreich geladen'}</ThemedText>
    {Number.isFinite(amount) && amount > 0 ? <ThemedText>Umgerechnet: {formatCurrency(Math.round(amount * result.rate * 100) / 100, to)}</ThemedText> : null}
  </View>;
}

export function ExchangeRatePreview(props: Props) {
  const [attempt, setAttempt] = useState(0);
  return <View style={{ gap: 8 }}>
    <Request key={attempt} {...props} />
    <Pressable accessibilityRole="button" onPress={() => { props.onResolved(undefined); setAttempt((value) => value + 1); }}><ThemedText>Wechselkurs erneut laden</ThemedText></Pressable>
  </View>;
}
