import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
const { isAuthenticated, user } = useAuthStore();
if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  if (user?.role !== 'ADMIN') {
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
          title: 'Admin Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Admin Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="admin-panel-settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}