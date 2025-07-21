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
import { useRouter } from 'expo-router';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuthStore();
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();

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

  const validateInput = (): boolean => {
    if (!username.trim()) {
      showToast("error", "Please enter your username");
      return false;
    }

    if (!password.trim()) {
      showToast("error", "Please enter your password");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInput()) return;

    setLoading(true);
    try {
      await login(username.trim(), password);

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        showToast("success", `Welcome back, ${currentUser.username}!`);

        // Navigate based on role
        if (currentUser.role === "ADMIN") {
          navigate.toAdminHome();
        } else {
          navigate.toUserHome();
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  const createStyles = (theme: Theme) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 24,
      },
      backgroundDecoration: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "50%",
        zIndex: -1,
      },
      circle1: {
        position: "absolute",
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: theme.colors.primary + "10",
        opacity: 0.6,
      },
      circle2: {
        position: "absolute",
        top: 50,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary + "20",
        opacity: 0.4,
      },
      circle3: {
        position: "absolute",
        top: 200,
        right: 30,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary + "30",
        opacity: 0.3,
      },
      themeButton: {
        position: "absolute",
        top: 50,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: theme.colors.shadowColor,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
      },
      themeIcon: {
        fontSize: 24,
        color: theme.colors.text,
      },
      onBoardingButton: {
        position: "absolute",
        top: 50,
        right: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: theme.colors.shadowColor,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
      },
      onBoardingIcon: {
        fontSize: 24,
        color: theme.colors.text,
      },
      header: {
        alignItems: "center",
        paddingTop: 60,
        paddingBottom: 40,
      },
      logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.card,
        alignItems: "center",
        justifyContent: "center",
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
        resizeMode: "contain",
      },
      title: {
        fontSize: 32,
        fontWeight: "700",
        color: theme.colors.text,
        marginBottom: 8,
        letterSpacing: -0.5,
      },
      subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
      },
      formContainer: {
        flex: 1,
        alignItems: "center",
      },
      formCard: {
        width: "100%",
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
        fontWeight: "700",
        color: theme.colors.text,
        marginBottom: 32,
        textAlign: "center",
      },
      inputGroup: {
        marginBottom: 24,
      },
      inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.textSecondary,
        marginBottom: 8,
        marginLeft: 4,
      },
      inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
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
        height: "100%",
      },
      eyeButton: {
        padding: 4,
      },
      eyeIcon: {
        fontSize: 22,
        color: theme.colors.placeholder,
      },
      optionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
      },
      rememberContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 6,
        marginRight: 8,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
      },
      checkboxActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      checkIcon: {
        fontSize: 12,
        color: theme.colors.onPrimary,
      },
      rememberText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: "500",
      },
      forgotText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: "600",
      },
      loginButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
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
      loginButtonDisabled: {
        opacity: 0.7,
      },
      loginButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.onPrimary,
        marginRight: 8,
      },
      buttonIcon: {
        fontSize: 20,
        color: theme.colors.onPrimary,
      },
      dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
      },
      divider: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.divider,
      },
      dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: theme.colors.placeholder,
        fontWeight: "500",
      },
      socialButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 32,
        gap: 12,
      },
      socialButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        backgroundColor: theme.colors.inputBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
      },
      socialIcon: {
        fontSize: 20,
        color: theme.colors.textMuted,
        marginRight: 8,
      },
      socialButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.colors.textMuted,
      },
      signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      },
      signupText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
      },
      signupLink: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: "600",
      },
    });

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Background Decoration */}
      <View style={styles.backgroundDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* theme button*/}
        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <MaterialIcons
            name={isDark ? "dark-mode" : "light-mode"}
            style={styles.themeIcon}
          />
        </TouchableOpacity>

        {/* onboarding button*/}
        <TouchableOpacity style={styles.onBoardingButton} onPress={() => router.push('/onboarding')}>
          <MaterialIcons
            name="play-circle-outline"
            style={styles.onBoardingIcon}
          />
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>Study Agent</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please sign in to your account
          </Text>
        </View>

        {/* Login Form Section */}
        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Sign In</Text>

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

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-outline" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember & Forgot Password */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxActive]}
                >
                  {rememberMe && (
                    <MaterialIcons name="check" style={styles.checkIcon} />
                  )}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigate.toForgotPassword()}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
              {!loading && (
                <MaterialIcons name="arrow-forward" style={styles.buttonIcon} />
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialIcons name="g-translate" style={styles.socialIcon} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <MaterialIcons name="facebook" style={styles.socialIcon} />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigate.toRegister()}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
}
