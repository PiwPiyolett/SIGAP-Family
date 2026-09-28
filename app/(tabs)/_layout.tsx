// app/(tabs)/_layout.tsx — Bottom tabs SIPERKASA Family (Dark Guardian).
import { Tabs } from 'expo-router';
import { LayoutDashboard, UserCog } from 'lucide-react-native';
import { Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { fontFamily } from '@/constants/typography';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryContainer,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.interSemiBold,
          fontSize: 11,
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <UserCog color={color} size={size} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
