import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function HomeHeaderButton({ tintColor }: { tintColor: string }) {
  return (
    <Pressable
      onPress={() => router.navigate('/')}
      style={{ marginLeft: 16 }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go to home">
      <Ionicons name="home" size={24} color={tintColor} />
    </Pressable>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: 'decision, decisions.....',
          headerLeft: () => <HomeHeaderButton tintColor={colors.tint} />,
          tabBarIcon: ({ color }) => <Ionicons name="list" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="spin"
        options={{
          title: 'Spin',
          headerLeft: () => <HomeHeaderButton tintColor={colors.tint} />,
          tabBarIcon: ({ color }) => <Ionicons name="sync" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
