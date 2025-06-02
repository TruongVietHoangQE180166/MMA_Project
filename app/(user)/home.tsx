import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { AuthButton } from '../../components/AuthButton';
import { COLORS, SIZES } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function UserHome() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome User</Text>
      <Text style={styles.subtitle}>Email: {user?.email}</Text>
      <AuthButton title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.margin,
  },
  subtitle: {
    fontSize: SIZES.medium,
    textAlign: 'center',
    marginBottom: SIZES.margin * 2,
    color: COLORS.secondary,
  },
});