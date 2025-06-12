import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { COLORS } from '../../constants/theme';
import { navigate } from '../../utils/navigation';

export default function EmailSent() {
  const [otp, setOtp] = useState(''); 
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { email } = useLocalSearchParams();
  const userEmail = Array.isArray(email) ? email[0] : email;

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    Toast.show({
      type,
      text1: type.charAt(0).toUpperCase() + type.slice(1),
      text2: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  };

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
     
  const validateOtp = (inputOtp: string): boolean => { // Đổi từ validateCode thành validateOtp
    const otpRegex = /^\d{6}$/;
    const isValid = otpRegex.test(inputOtp);
         
    if (!inputOtp.trim()) {
      showToast('error', 'Please enter the verification code');
      return false;
    } else if (!isValid) {
      showToast('error', 'Please enter a valid 6-digit code');
      return false;
    }
    return true;
  };

  const handleOtpChange = (text: string) => { // Đổi từ handleCodeChange thành handleOtpChange
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericText); 
  };

  const handleVerify = async () => {
    if (!validateOtp(otp)) return; 
    
    if (!userEmail) {
      showToast('error', 'Email is required');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("userEmail", userEmail);
      console.log("otp", otp);
      navigate.toResetPassword(otp, userEmail); 
    } catch (error: any) {
      showToast('error', 'Failed to proceed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!userEmail) {
      showToast('error', 'Email is required to resend code');
      return;
    }

    setIsResending(true);
         
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
             
      setCountdown(30);
      setCanResend(false);
      setOtp(''); // Đổi từ setCode thành setOtp
             
      showToast('success', 'Verification code has been resent to your email');
    } catch (error) {
      showToast('error', 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
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
              style={styles.inputWithIcon}
              placeholder="Enter verification code"
              placeholderTextColor={styles.placeholderColor.color}
              value={otp}
              onChangeText={(text) => handleOtpChange(text)}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          
          {/* Validation message */}
          {false && (
            <Text style={styles.validationText}>
              {''}
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
          onPress={handleVerify}
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
      <Toast />
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