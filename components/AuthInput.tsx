import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface AuthInputProps extends TextInputProps {
  placeholder: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ placeholder, ...props }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    placeholderTextColor={COLORS.secondary}
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginVertical: SIZES.margin / 2,
    fontSize: SIZES.medium,
  },
});