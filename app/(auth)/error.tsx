import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Logo } from '../../components/Logo';
import { AuthButton } from '../../components/AuthButton';
import { COLORS, SIZES } from '../../constants/theme';

export default function Error() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Logo />
      <View style={styles.iconContainer}>
        <MaterialIcons name="error-outline" size={80} color={COLORS.danger} />
      </View>
      
      <Text style={styles.title}>Oops! Something went wrong</Text>
      <Text style={styles.subtitle}>
        We encountered an unexpected error. Please try again or contact support if the problem persists.
      </Text>
      
      <AuthButton
        title="Try Again"
        onPress={() => router.back()}
      />
      
      <AuthButton
        title="Go to Home"
        onPress={() => router.replace('/')}
        variant="secondary"
      />
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: SIZES.margin * 2,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.margin,
    color: COLORS.danger,
  },
  subtitle: {
    fontSize: SIZES.medium,
    textAlign: 'center',
    marginBottom: SIZES.margin * 2,
    color: COLORS.secondary,
    lineHeight: 24,
  },
});