import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AppProvider } from '@/context/AppContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add-transaction" options={{ presentation: 'modal', title: 'Neue Transaktion' }} />
          <Stack.Screen name="transaction/[id]" options={{ title: 'Transaktionsdetails' }} />
        </Stack>
      </AppProvider>
    </ThemeProvider>
  );
}
