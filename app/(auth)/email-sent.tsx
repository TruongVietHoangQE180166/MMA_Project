import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  StatusBar 
} from 'react-native';
import Toast from 'react-native-toast-message';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { navigate } from '../../utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import { useTheme, Theme } from "../../contexts/ThemeContext";

export default function EmailSent() {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyOTP } = useAuthStore();
  const { email } = useLocalSearchParams();
  const userEmail = Array.isArray(email) ? email[0] : email;
  const { theme, isDark, toggleTheme } = useTheme();

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

  const validateCode = (inputCode: string): boolean => {
    const codeRegex = /^\d{6}$/;
    const isValid = codeRegex.test(inputCode);
    
    if (!inputCode.trim()) {
      showToast('error', 'Please enter the verification code');
      return false;
    } else if (!isValid) {
      showToast('error', 'Please enter a valid 6-digit code');
      return false;
    }
    return true;
  };

  const handleCodeChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setCode(numericText);
  };

  const handleVerify = async () => {
    if (!validateCode(code)) return;

    setIsSubmitting(true);
    try {
      await verifyOTP(userEmail, code);
      showToast('success', 'Verification successful!');
      navigate.toLogin();
    } catch (error: any) {
      showToast('error', error.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCountdown(30);
      setCanResend(false);
      setCode('');
      
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

  const maskEmail = (email: string): string => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.slice(0, 2) + '***' + username.slice(-1);
    return `${maskedUsername}@${domain}`;
  };

  const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    backgroundDecoration: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      zIndex: -1,
    },
    circle1: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: theme.colors.primary + '10',
      opacity: 0.6,
    },
    circle2: {
      position: 'absolute',
      top: 50,
      left: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary + '20',
      opacity: 0.4,
    },
    circle3: {
      position: 'absolute',
      top: 200,
      right: 30,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary + '30',
      opacity: 0.3,
    },
    header: {
      alignItems: 'center',
      paddingTop: 120,
      paddingBottom: 20,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    logo: {
      width: 50,
      height: 50,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    emailIconContainer: {
      alignItems: 'center',
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    emailIconWrapper: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    emailIcon: {
      fontSize: 48,
      color: theme.colors.primary,
    },
    emailInfoContainer: {
      alignItems: 'center',
    },
    emailSentText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    maskedEmail: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    formContainer: {
      flex: 1,
      alignItems: 'center',
      paddingBottom: 20,
    },
    formCard: {
      width: '100%',
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: 32,
      marginBottom: 30,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    formTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    formDescription: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 32,
      paddingHorizontal: 8,
    },
    inputGroup: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme.colors.inputBorder,
      paddingHorizontal: 16,
      height: 56,
    },
    inputIcon: {
      fontSize: 22,
      color: theme.colors.placeholder,
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 18,
      color: theme.colors.text,
      height: '100%',
      textAlign: 'center',
      fontWeight: '600',
      letterSpacing: 2,
    },
    resendContainer: {
      alignItems: 'center',
      marginBottom: 32,
      minHeight: 40,
      justifyContent: 'center',
    },
    countdownText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    resendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    resendText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
    resendIcon: {
      fontSize: 18,
      color: theme.colors.primary,
    },
    disabledText: {
      color: theme.colors.placeholder,
    },
    verifyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    verifyButtonDisabled: {
      opacity: 0.5,
    },
    verifyButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onPrimary,
      marginRight: 8,
    },
    buttonIcon: {
      fontSize: 20,
      color: theme.colors.onPrimary,
    },
    backContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    backLink: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Background Decoration */}
      <View style={styles.backgroundDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>Study Agent</Text>
          <Text style={styles.subtitle}>Check your email for verification code</Text>
        </View>

        {/* Email Icon Section */}
        <View style={styles.emailIconContainer}>
          <View style={styles.emailIconWrapper}>
            <MaterialIcons name="mark-email-read" style={styles.emailIcon} />
          </View>
          <View style={styles.emailInfoContainer}>
            <Text style={styles.emailSentText}>Code sent to</Text>
            <Text style={styles.maskedEmail}>{maskEmail(userEmail)}</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Enter Verification Code</Text>
            <Text style={styles.formDescription}>
              We've sent a 6-digit verification code to your email address. 
              Please enter it below to verify your account.
            </Text>
            
            {/* Verification Code Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Verification Code</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="security" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#9CA3AF"
                  value={code}
                  onChangeText={handleCodeChange}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
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
                  <MaterialIcons name="refresh" style={[styles.resendIcon, isResending && styles.disabledText]} />
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, (isSubmitting || !code) && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={isSubmitting || !code}
            >
              <Text style={styles.verifyButtonText}>
                {isSubmitting ? "Verifying..." : "Verify Code"}
              </Text>
              {!isSubmitting && (
                <MaterialIcons name="verified-user" style={styles.buttonIcon} />
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.backContainer}>
              <Text style={styles.backText}>Having trouble? </Text>
              <TouchableOpacity onPress={() => navigate.toLogin()}>
                <Text style={styles.backLink}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}