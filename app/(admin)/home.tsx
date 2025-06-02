import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { AuthButton } from '../../components/AuthButton';
import { COLORS, SIZES } from '../../constants/theme';

export default function AdminHome() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="admin-panel-settings" size={50} color={COLORS.danger} />
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome, {user?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialIcons name="people" size={30} color={COLORS.primary} />
          <Text style={styles.statNumber}>150</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="trending-up" size={30} color={COLORS.success} />
          <Text style={styles.statNumber}>23</Text>
          <Text style={styles.statLabel}>New Today</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialIcons name="security" size={30} color={COLORS.warning} />
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <AuthButton title="Manage Users" onPress={() => {}} variant="secondary" />
        <AuthButton title="System Settings" onPress={() => {}} variant="secondary" />
        <AuthButton title="View Reports" onPress={() => {}} variant="secondary" />
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
  title: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    marginTop: SIZES.margin,
    color: COLORS.danger,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.secondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  statCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 8,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.secondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginHorizontal: SIZES.margin,
    borderRadius: SIZES.borderRadius,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
    color: COLORS.dark,
  },
});