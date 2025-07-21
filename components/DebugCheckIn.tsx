import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { testCheckInUtils } from '../utils/testCheckIn';
import { useTheme } from '../contexts/ThemeContext';

export const DebugCheckIn = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleReset = async () => {
    await testCheckInUtils.resetForTesting();
  };

  const handleShowData = async () => {
    await testCheckInUtils.showCurrentData();
  };

  const handleShowAllData = async () => {
    await testCheckInUtils.showAllCheckInData();
  };

  const handleTestCheckIn = async () => {
    await testCheckInUtils.testTodayCheckIn();
  };

  const handleShowUsage = () => {
    testCheckInUtils.showUsage();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Check-in</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Check-in Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleShowData}>
        <Text style={styles.buttonText}>Show Current Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleShowAllData}>
        <Text style={styles.buttonText}>Show All AsyncStorage</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleTestCheckIn}>
        <Text style={styles.buttonText}>Test Check-in</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleShowUsage}>
        <Text style={styles.buttonText}>Show Usage Guide</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 