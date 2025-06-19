import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuthButton } from '../../components/AuthButton';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function UserProfile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="account-circle" size={100} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>User Profile</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color={COLORS.secondary} />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="badge" size={20} color={COLORS.secondary} />
          <Text style={styles.infoText}>Role: {user?.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="verified-user" size={20} color={COLORS.success} />
          <Text style={styles.infoText}>Account Verified</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <AuthButton title="Change Password" onPress={() => {}} variant="secondary" />
        <AuthButton title="Update Profile" onPress={() => {}} variant="secondary" />
        <AuthButton title="Logout" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  avatarContainer: {
    marginBottom: SIZES.margin,
  },
  name: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 4,
    color: COLORS.dark,
  },
  email: {
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginBottom: SIZES.margin,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
    color: COLORS.dark,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding / 2,
  },
  infoText: {
    marginLeft: SIZES.margin,
    fontSize: SIZES.medium,
    color: COLORS.dark,
  },
});