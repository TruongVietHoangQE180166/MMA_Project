import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

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
        tabBarActiveTintColor: COLORS.skyBlue,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <MaterialIcons name="bar-chart" size={24} color="#00aff0" />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <AntDesign name="user" size={24} color="#00aff0" />,
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: 'Giao dịch',
          tabBarIcon: ({ color }) => <AntDesign name="user" size={24} color="#00aff0" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color="#00aff0" />,
        }}
      />
    </Tabs>
  );
}