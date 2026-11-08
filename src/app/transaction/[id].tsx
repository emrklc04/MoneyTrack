import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppContext } from '@/context/AppContext';
import { formatCurrency } from '@/utils/formatCurrency';

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transactions, categories, homeCurrency, deleteTransaction } = useAppContext();
  const transaction = transactions.find((item) => item.id === id);

  if (!transaction) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Transaktion nicht gefunden</ThemedText>
      </ThemedView>
    );
  }

  const category = categories.find((item) => item.id === transaction.categoryId);
  const transactionId = transaction.id;

  function confirmDelete() {
    Alert.alert('Transaktion löschen?', 'Dieser Eintrag wird aus dem gemeinsamen App-Zustand entfernt.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(transactionId);
            router.back();
          } catch {
            Alert.alert('Löschen fehlgeschlagen', 'Die Transaktion konnte nicht gelöscht werden.');
          }
        },
      },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Transaktionsdetails</ThemedText>
      <ThemedText type="subtitle">
        {transaction.type === 'income' ? '+' : '-'}
        {formatCurrency(
          transaction.convertedAmount ?? transaction.amount,
          transaction.convertedAmount === undefined ? transaction.currency : homeCurrency,
        )}
      </ThemedText>
      <ThemedText>{transaction.description}</ThemedText>
      <ThemedText>Kategorie: {category?.name ?? 'Unbekannte Kategorie'}</ThemedText>
      <ThemedText>Datum: {transaction.date}</ThemedText>
      <ThemedText>Originalbetrag: {formatCurrency(transaction.amount, transaction.currency)}</ThemedText>
      {transaction.receiptImageUri ? (
        <Image source={{ uri: transaction.receiptImageUri }} style={styles.receipt} contentFit="contain" />
      ) : null}
      <Pressable onPress={confirmDelete} style={styles.deleteButton}>
        <ThemedText style={styles.buttonText}>Transaktion löschen</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  receipt: {
    height: 240,
    borderRadius: 10,
  },
  deleteButton: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#c62828',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
