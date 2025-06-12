import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function UserLayout() {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  if (user?.role !== 'USER') {
    return <Redirect href="/" />;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}