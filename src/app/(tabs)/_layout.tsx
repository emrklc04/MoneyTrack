import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={typeof color === 'string' ? color : '#208AEF'} />;
  };
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#208AEF' }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="transactions"
        options={{ title: 'Transaktionen', tabBarIcon: tabIcon('swap-horizontal', 'swap-horizontal-outline') }}
      />
      <Tabs.Screen
        name="statistics"
        options={{ title: 'Statistiken', tabBarIcon: tabIcon('pie-chart', 'pie-chart-outline') }}
      />
      <Tabs.Screen
        name="budgets"
        options={{ title: 'Budgets', tabBarIcon: tabIcon('wallet', 'wallet-outline') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Einstellungen', tabBarIcon: tabIcon('settings', 'settings-outline') }}
      />
    </Tabs>
  );
}
