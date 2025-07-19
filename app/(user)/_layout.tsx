import React from 'react';
import { TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';

// Type definitions
interface TabBarIconProps {
  color: string;
  focused: boolean;
  size?: number;
}

interface TabBarButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityState: {
    selected: boolean;
  };
}

interface TabBarStyleConfig {
  backgroundColor: string;
  borderTopWidth: number;
  elevation: number;
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  height: number;
  paddingBottom: number;
  paddingTop: number;
  borderTopLeftRadius: number;
  borderTopRightRadius: number;
  position: 'absolute' | 'relative';
}

interface TabBarItemStyleConfig {
  borderRadius: number;
  marginHorizontal: number;
  paddingVertical: number;
}

interface TabBarLabelStyleConfig {
  fontSize: number;
  fontWeight: '600' | 'normal' | 'bold';
  marginTop: number;
}

interface TabBarIconStyleConfig {
  marginBottom: number;
}

function TabsWithTheme() {
  const { theme } = useTheme();

  const tabBarStyle = {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: theme.colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    height: 88,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute' as 'absolute',
  };

  const tabBarItemStyle = {
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 8,
  };

  const tabBarLabelStyle = {
    fontSize: 12,
    fontWeight: 600 as const,
    marginTop: 4,
  };

  const tabBarIconStyle = {
    marginBottom: 2,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle,
        tabBarItemStyle,
        tabBarLabelStyle,
        tabBarIconStyle,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="home" size={focused ? 28 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Study-Point',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="star" size={focused ? 28 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="stats-chart" size={focused ? 28 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat with AI',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="chat" size={focused ? 28 : 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome6 name="user" size={focused ? 26 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-session-study"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="StudySession"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}

export default function UserLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role !== 'USER') {
    return <Redirect href="/" />;
  }

  return <TabsWithTheme />;
}

// Enhanced TabBarButton component with proper typing and improved animations
const TabBarButton: React.FC<TabBarButtonProps> = ({ 
  children, 
  onPress, 
  accessibilityState 
}) => {
  const focused = accessibilityState?.selected || false;
  
  const buttonStyle: ViewStyle = {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: focused ? `${COLORS.primary}15` : 'transparent',
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 8,
    transform: [{ scale: focused ? 1.05 : 1 }],
    // Add subtle border for focused state
    borderWidth: focused ? 1 : 0,
    borderColor: focused ? `${COLORS.primary}30` : 'transparent',
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonStyle}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
    >
      {children}
    </TouchableOpacity>
  );
};