import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, Image, TextInput, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SIZES } from '../../constants/theme';
import { navigate } from '../../utils/navigation';
import { MaterialIcons } from '@expo/vector-icons';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      navigate.toEmailSent();
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo} 
        />
        <Text style={styles.title}>Study-Agent</Text>
        <Text style={styles.subtitle}>Don't worry, we'll help you!</Text>
      </View>

      {/* Forgot Password Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Forgot Password?</Text>
        <Text style={styles.formSubtitle}>Enter your email to reset your password</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter your email"
              placeholderTextColor={styles.placeholderColor.color}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity 
          style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
          onPress={handleResetPassword}
          disabled={loading}
        >
          <Text style={styles.resetButtonText}>
            {loading ? "Sending..." : "Send Instructions"}
          </Text>
        </TouchableOpacity>

        {/* Back to Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigate.toLogin()}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Decoration */}
      <View style={styles.bottomDecoration}>
        <Image source={require('../../assets/images/pen.png')} style={styles.bottomPen} />
        <Image source={require('../../assets/images/pen.png')} style={styles.bottomPen} />
        <Image source={require('../../assets/images/pen.png')} style={styles.bottomPen} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.skyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Header Section
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
    fontFamily: 'Jua-Regular',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Jua-Regular',
  },
  
  // Form Section
  formSection: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    paddingHorizontal: 46,
    width: '100%',
  },
  formTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'Jua-Regular',
    alignSelf: 'flex-start',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'Jua-Regular',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  
  // Input Fields
  inputContainer: {
    marginBottom: 40,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
  },
  inputIcon: {
    fontSize: 30,
    color: '#666',
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
    color: '#333',
  },
  placeholderColor: {
    color: '#999',
  },
  
  // Reset Button
  resetButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '75%',
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Login Section
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  loginLink: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  
  // Bottom Decoration
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: -20, 
  },
  bottomPen: {
    width: 156,
    height: 133,
    resizeMode: 'contain',
    marginHorizontal: -15, 
  },
});