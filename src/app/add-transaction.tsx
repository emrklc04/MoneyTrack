import { useCallback, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ExchangeRatePreview } from '@/components/ExchangeRatePreview';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionType } from '@/models/Transaction';
import { type ExchangeRate, SUPPORTED_CURRENCIES } from '@/services/currencyService';
import { saveReceiptImage } from '@/services/receiptService';

export default function AddTransactionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const optionSurface = { backgroundColor: theme.backgroundElement };
  const inputColors = { color: theme.text, backgroundColor: theme.background, borderColor: theme.textSecondary };
  const { addTransaction, categories, homeCurrency } = useAppContext();
  const [transactionId] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currency, setCurrency] = useState(homeCurrency);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>();
  const onRateResolved = useCallback((rate: ExchangeRate | undefined) => setExchangeRate(rate), []);
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | undefined>();
  const [cameraReady, setCameraReady] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const captureRef = useRef(false);
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const availableCategories = categories.filter((category) => category.type === type);

  async function openCamera() {
    try {
      const result = permission?.granted ? permission : await requestPermission();
      if (!result.granted) {
        Alert.alert('Kamera nicht erlaubt', result.canAskAgain
          ? 'Ohne Kameraberechtigung kann kein Beleg fotografiert werden.'
          : 'Bitte erlaube den Kamerazugriff in den Geräteeinstellungen.');
        return;
      }
      setCameraReady(false);
      setCameraOpen(true);
    } catch {
      Alert.alert('Kamera nicht verfügbar', 'Die Kamera konnte nicht geöffnet werden.');
    }
  }

  async function takePhoto() {
    if (!cameraReady || captureRef.current) return;
    captureRef.current = true;
    setTakingPhoto(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (photo) {
        setReceiptUri(saveReceiptImage(photo.uri, transactionId));
      }
    } catch {
      Alert.alert('Foto fehlgeschlagen', 'Der Beleg konnte nicht gespeichert werden.');
    }
    captureRef.current = false;
    setTakingPhoto(false);
    setCameraOpen(false);
  }

  async function handleSave() {
    const numericAmount = Number(amount.replace(',', '.'));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || !description.trim() || !categoryId) {
      Alert.alert('Eingaben prüfen', 'Bitte gib einen gültigen Betrag, eine Kategorie und eine Beschreibung ein.');
      return;
    }

    if (savingRef.current) return;
    if (currency !== homeCurrency && (!exchangeRate || exchangeRate.from !== currency || exchangeRate.to !== homeCurrency)) {
      Alert.alert('Kein Wechselkurs', 'Bitte lade zuerst einen Wechselkurs oder wähle die Hauptwährung.');
      return;
    }
    savingRef.current = true;
    setSaving(true);
    const convertedAmount = Math.round(numericAmount * (currency === homeCurrency ? 1 : exchangeRate!.rate) * 100) / 100;

    try {
      await addTransaction({
        id: transactionId,
        type,
        amount: numericAmount,
        currency,
        convertedAmount,
        categoryId,
        date: new Date().toISOString().slice(0, 10),
        description: description.trim(),
        receiptImageUri: receiptUri,
      });
      router.back();
    } catch {
      Alert.alert('Speichern fehlgeschlagen', 'Die Transaktion konnte nicht lokal gespeichert werden.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  if (cameraOpen) {
    return (
      <ThemedView style={styles.container}>
        <CameraView onCameraReady={() => setCameraReady(true)} onMountError={() => {
          setCameraOpen(false); Alert.alert('Kamera nicht verfügbar', 'Die Kamera konnte nicht gestartet werden.');
        }} ref={cameraRef} facing="back" style={styles.camera} />
        <View style={styles.cameraActions}>
          <Pressable onPress={() => setCameraOpen(false)} style={styles.cameraButton}>
            <ThemedText style={styles.buttonText}>Abbrechen</ThemedText>
          </Pressable>
          <Pressable disabled={!cameraReady || takingPhoto} onPress={takePhoto} style={styles.saveButton}>
            <ThemedText style={styles.buttonText}>Foto aufnehmen</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View pointerEvents={saving ? "none" : "auto"} style={{ gap: 16 }}>
        <ThemedText type="title">Neue Transaktion</ThemedText>
        <View style={styles.row}>
          {(['expense', 'income'] as const).map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                setType(option);
                setCategoryId('');
              }}
              style={[styles.typeButton, optionSurface, type === option && styles.selected]}
            >
              <ThemedText style={type === option ? styles.selectedText : undefined}>
                {option === 'expense' ? 'Ausgabe' : 'Einnahme'}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        <TextInput
          accessibilityLabel="Betrag"
          keyboardType="decimal-pad"
          onChangeText={setAmount}
          placeholder="Betrag"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, inputColors]}
          value={amount}
        />
        <TextInput
          accessibilityLabel="Beschreibung"
          onChangeText={setDescription}
          placeholder="Beschreibung"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, inputColors]}
          value={description}
        />
        <ThemedText type="smallBold">Währung</ThemedText>
        <View style={styles.row}>
          {SUPPORTED_CURRENCIES.map((code) => (
            <Pressable
              key={code}
              onPress={() => { if (code !== currency) { setExchangeRate(undefined); setCurrency(code); } }}
              style={[styles.category, optionSurface, currency === code && styles.selected]}
            >
              <ThemedText style={currency === code ? styles.selectedText : undefined}>{code}</ThemedText>
            </Pressable>
          ))}
        </View>
        {currency !== homeCurrency ? (
          <ExchangeRatePreview key={`${currency}-${homeCurrency}`} from={currency} to={homeCurrency}
            amount={Number(amount.replace(',', '.'))} onResolved={onRateResolved} />
        ) : null}
        <ThemedText type="smallBold">Kategorie</ThemedText>
        <View style={styles.row}>
          {availableCategories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => setCategoryId(category.id)}
              style={[styles.category, optionSurface, categoryId === category.id && styles.selected]}
            >
              <ThemedText style={categoryId === category.id ? styles.selectedText : undefined}>
                {category.name}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        <ThemedText type="small">Datum: {new Date().toISOString().slice(0, 10)}</ThemedText>
        <Pressable onPress={openCamera} style={[styles.receiptButton, optionSurface]}>
          <ThemedText>{receiptUri ? 'Beleg ersetzen' : 'Beleg hinzufügen'}</ThemedText>
        </Pressable>
        {receiptUri ? <Image source={{ uri: receiptUri }} style={styles.receiptPreview} contentFit="cover" /> : null}
        <Pressable disabled={saving} onPress={handleSave} style={[styles.saveButton, saving && styles.disabled]}>
          <ThemedText style={styles.buttonText}>{saving ? 'Wird gespeichert…' : 'Speichern'}</ThemedText>
        </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 24,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  category: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
  },
  selected: {
    backgroundColor: '#2563eb',
  },
  selectedText: {
    color: '#ffffff',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  saveButton: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  disabled: {
    opacity: 0.6,
  },
  camera: {
    flex: 1,
  },
  cameraActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  cameraButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#616161',
  },
  receiptButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  receiptPreview: {
    height: 200,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
