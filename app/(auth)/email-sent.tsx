import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../../constants/theme';
import { navigate } from '../../utils/navigation';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmailSent() {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Validate verification code
  const validateCode = (inputCode: string): boolean => {
    // Check if code is exactly 6 digits
    const codeRegex = /^\d{6}$/;
    return codeRegex.test(inputCode);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!validateCode(code)) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Success', 'Code verified successfully!', [
        { text: 'OK', onPress: () => navigate.toResetPassword() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset countdown and states
      setCountdown(30);
      setCanResend(false);
      setCode('');
      
      Alert.alert('Success', 'Verification code has been resent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    setCode(numericText);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <Text style={styles.subtitle}>Check your email for verification!</Text>
      </View>

      {/* Email Icon Section */}
      <View style={styles.emailIconContainer}>
        <Image 
          source={require('../../assets/images/mail.png')}
          style={styles.emailImage}
          resizeMode="contain"
        />
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Email Sent</Text>
        <Text style={styles.formSubtitle}>
          We've sent a verification code to your email address.
          Please enter the code below to continue.
        </Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="security" style={styles.inputIcon} />
            <TextInput
              style={[
                styles.inputWithIcon,
                !validateCode(code) && code.length === 6 ? styles.invalidInput : null
              ]}
              placeholder="Enter 6-digit code"
              placeholderTextColor={styles.placeholderColor.color}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              editable={!isSubmitting}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          
          {/* Validation message */}
          {code.length > 0 && !validateCode(code) && (
            <Text style={styles.validationText}>
              {code.length < 6 ? 'Code must be 6 digits' : 'Please enter a valid code'}
            </Text>
          )}
        </View>

        {/* Countdown and Resend */}
        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.countdownText}>
              Resend code in {formatTime(countdown)}
            </Text>
          ) : (
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={isResending}
            >
              <Text style={[styles.resendText, isResending && styles.disabledText]}>
                {isResending ? 'Sending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </Text>
        </TouchableOpacity>

        {/* Back to Login Link */}
        <View style={styles.backContainer}>
          <Text style={styles.backText}>Want to try again? </Text>
          <TouchableOpacity 
            onPress={() => navigate.toLogin()}
          >
            <Text style={styles.backLink}>
              Back to Login
            </Text>
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

  // Email Icon Section
  emailIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emailImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  
  // Form Section
  formSection: {
    flex: 1,
    paddingTop: 15,
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
    lineHeight: 20,
  },
  
  // Input Fields
  inputContainer: {
    marginBottom: 20,
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
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  invalidInput: {
    borderColor: '#ff4444',
    backgroundColor: '#fff5f5',
  },
  placeholderColor: {
    color: '#999',
  },
  validationText: {
    color: '#ff4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
  },

  // Resend Section
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 30,
  },
  countdownText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  
  // Submit Button
  submitButton: {
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Back Section
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  backLink: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  disabledText: {
    color: '#ccc',
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