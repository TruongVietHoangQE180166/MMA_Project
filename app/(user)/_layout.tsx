import { MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function UserLayout() {
  const { isAuthenticated, user } = useAuthStore();
  
  // Kiểm tra quyền truy cập
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }
  
  if (user?.role !== 'user') {
    return <Redirect href="/" />;
  }
  
  // Render tabs navigation của user nếu có quyền
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
        name="finance"
        options={{
          title: 'Finance',
          tabBarIcon: ({ color }) => <Entypo name="wallet" size={23} color={color} />,
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