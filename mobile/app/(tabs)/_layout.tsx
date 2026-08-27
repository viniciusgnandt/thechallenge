import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'flame' : 'flame-outline'} size={25} color={color} />,
      }} />
      <Tabs.Screen name="explore" options={{
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'compass' : 'compass-outline'} size={25} color={color} />,
      }} />
      <Tabs.Screen name="create" options={{
        tabBarIcon: () => (
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
        ),
      }} />
      <Tabs.Screen name="notifications" options={{
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={24} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={26} color={color} />,
      }} />
    </Tabs>
  );
}
