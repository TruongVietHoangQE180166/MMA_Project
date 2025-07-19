import { MaterialIcons } from "@expo/vector-icons";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuthStore();
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

  const validateEmail = (inputEmail: string): boolean => {
    if (!inputEmail.trim()) {
      showToast("error", "Please enter your email");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputEmail.trim())) {
      showToast("error", "Please enter a valid email address");
      return false;
    }
    return true;
  };

  const validateUsername = (inputUsername: string): boolean => {
    if (!inputUsername.trim()) {
      showToast("error", "Please enter your username");
      return false;
    }
    if (inputUsername.trim().length < 3) {
      showToast("error", "Username must be at least 3 characters");
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateUsername(username) || !validateEmail(email)) {
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim(), username.trim());
      showToast(
        "success",
        "Password reset email sent! Please check your inbox."
      );

      setEmail("");
      setUsername("");

      setTimeout(() => navigate.toEmailSentReset(email), 2000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset email";
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
      paddingTop: 120,
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
      paddingHorizontal: 20,
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
      fontSize: 16,
      color: theme.colors.text,
      height: '100%',
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
          <Text style={styles.subtitle}>Don't worry, we'll help you reset your password</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Forgot Password?</Text>
            <Text style={styles.formDescription}>
              Enter your username and email to receive password reset instructions
            </Text>
            
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person-outline" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor="#9CA3AF"
                  value={username}
                  onChangeText={setUsername}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#9CA3AF"
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
              {!loading && (
                <MaterialIcons name="send" style={styles.buttonIcon} />
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