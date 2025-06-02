import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { Redirect } from 'expo-router';

export default function AdminLayout() {
const { isAuthenticated, user } = useAuthStore();
if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  if (user?.role !== 'admin') {
    return <Redirect href="/" />;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.danger,
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