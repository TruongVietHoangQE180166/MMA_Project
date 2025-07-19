import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import Toast from "react-native-toast-message";
import { COLORS } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";
import { navigate } from "../../utils/navigation";
import { useTheme, Theme } from "../../contexts/ThemeContext";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { otp, email } = useLocalSearchParams();
  const userOtp = Array.isArray(otp) ? otp[0] : otp;
  const userEmail = Array.isArray(email) ? email[0] : email;
  const { resetPassword } = useAuthStore();
  const { theme, isDark, toggleTheme } = useTheme();

  const showToast = (type: "success" | "error" | "info", message: string) => {
    Toast.show({
      type,
      text1: type.charAt(0).toUpperCase() + type.slice(1),
      text2: message,
      position: "top",
      visibilityTime: 3000,
      autoHide: true,
      topOffset: 50,
    });
  };

  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      showToast("error", "Please enter your password");
      return false;
    }
    if (password.length < 6) {
      showToast("error", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): boolean => {
    if (!confirmPassword.trim()) {
      showToast("error", "Please confirm your password");
      return false;
    }
    if (password !== confirmPassword) {
      showToast("error", "Passwords do not match");
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!userEmail || !userOtp) {
      showToast("error", "Missing required information. Please try again.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      showToast("error", "Please fill all fields");
      return;
    }

    if (!validatePassword(newPassword)) return;
    if (!validateConfirmPassword(newPassword, confirmPassword)) return;

    setLoading(true);
    try {
      await resetPassword(userEmail, userOtp, newPassword.trim());
      showToast("success", "Password reset successfully!");
      setTimeout(() => navigate.toLogin(), 1500);
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 24,
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
      paddingTop: 60,
      paddingBottom: 40,
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
    formContainer: {
      flex: 1,
      alignItems: 'center',
    },
    formCard: {
      width: '100%',
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: 32,
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
    formSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
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
      fontSize: 16,
      color: theme.colors.text,
      height: '100%',
    },
    eyeButton: {
      padding: 4,
    },
    eyeIcon: {
      fontSize: 22,
      color: theme.colors.placeholder,
    },
    requirementsContainer: {
      marginBottom: 32,
      padding: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    requirementsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    requirementIcon: {
      fontSize: 16,
      color: theme.colors.divider,
      marginRight: 8,
    },
    requirementIconActive: {
      color: theme.colors.success,
    },
    requirementText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    requirementTextActive: {
      color: theme.colors.success,
      fontWeight: '500',
    },
    resetButton: {
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
    resetButtonDisabled: {
      opacity: 0.7,
    },
    resetButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onPrimary,
      marginRight: 8,
    },
    buttonIcon: {
      fontSize: 20,
      color: theme.colors.onPrimary,
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loginText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    loginLink: {
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

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>Study Agent</Text>
          <Text style={styles.subtitle}>Create your new secure password</Text>
        </View>

        {/* Reset Password Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Reset Password</Text>
            <Text style={styles.formSubtitle}>Enter your new password below</Text>
            
            {/* New Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your new password"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons
                    name={showNewPassword ? "visibility" : "visibility-off"}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your new password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementItem}>
                <MaterialIcons 
                  name={newPassword.length >= 6 ? "check-circle" : "radio-button-unchecked"} 
                  style={[styles.requirementIcon, newPassword.length >= 6 && styles.requirementIconActive]} 
                />
                <Text style={[styles.requirementText, newPassword.length >= 6 && styles.requirementTextActive]}>
                  At least 6 characters
                </Text>
              </View>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={[styles.resetButton, loading && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.resetButtonText}>
                {loading ? "Resetting Password..." : "Reset Password"}
              </Text>
              {!loading && (
                <MaterialIcons name="security" style={styles.buttonIcon} />
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => navigate.toLogin()}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}