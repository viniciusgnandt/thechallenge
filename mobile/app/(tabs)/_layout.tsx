import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../../src/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0D0D0D', borderTopColor: colors.border, height: 64, paddingBottom: 8, paddingTop: 8 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'flame' : 'flame-outline'} size={25} color={color as string} />,
      }} />
      <Tabs.Screen name="explore" options={{
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={24} color={color as string} />,
      }} />
      <Tabs.Screen name="create" options={{
        tabBarIcon: () => (
          <LinearGradient colors={colors.gradientFire} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
            style={{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 6, ...shadow.primary }}>
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        ),
      }} />
      <Tabs.Screen name="notifications" options={{
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color as string} />,
      }} />
      <Tabs.Screen name="profile" options={{
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={26} color={color as string} />,
      }} />
    </Tabs>
  );
}
