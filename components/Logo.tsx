import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export const Logo = () => (
  <View style={styles.container}>
    <Text style={styles.text}>MyApp</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SIZES.margin * 2,
  },
  text: {
    fontSize: SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});