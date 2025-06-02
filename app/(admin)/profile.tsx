import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { AuthButton } from '../../components/AuthButton';
import { COLORS, SIZES } from '../../constants/theme';

export default function AdminProfile() {
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
          <MaterialIcons name="admin-panel-settings" size={100} color={COLORS.danger} />
        </View>
        <Text style={styles.name}>Administrator</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ADMIN</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Information</Text>
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color={COLORS.secondary} />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="admin-panel-settings" size={20} color={COLORS.secondary} />
          <Text style={styles.infoText}>Role: Administrator</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="security" size={20} color={COLORS.danger} />
          <Text style={styles.infoText}>Full System Access</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Actions</Text>
        <AuthButton title="Change Admin Password" onPress={() => {}} variant="secondary" />
        <AuthButton title="System Configuration" onPress={() => {}} variant="secondary" />
        <AuthButton title="User Management" onPress={() => {}} variant="secondary" />
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
    color: COLORS.danger,
  },
  email: {
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginBottom: SIZES.margin,
  },
  badge: {
    backgroundColor: COLORS.danger,
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