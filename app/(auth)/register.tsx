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
} from "react-native";
import Toast from 'react-native-toast-message';
import { COLORS } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";
import { navigate } from "../../utils/navigation";

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();

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

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      showToast('error', 'Please enter your email');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password.trim()) {
      showToast('error', 'Please enter your password');
      return false;
    }
    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
    if (!confirmPassword.trim()) {
      showToast('error', 'Please confirm your password');
      return false;
    }
    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      showToast('error', 'Please fill in all fields');
      return false;
    }
    if (!validateEmail(email)) return false;
    if (!validatePassword(password)) return false;
    if (!validateConfirmPassword(password, confirmPassword)) return false;
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(username, email, password, confirmPassword);
      showToast('success', 'Registration successful! Check your email for verification code');
      navigate.toEmailSent(email);
    } catch (error: any) {
      showToast('error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    showToast('info', 'Google sign-up functionality has not been implemented yet');
  };

  const handleAppleSignup = () => {
    showToast('info', 'Apple sign-up functionality has not been implemented yet');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Study-Agent</Text>
        <Text style={styles.subtitle}>Create your new account!</Text>
      </View>

      {/* Register Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Sign Up</Text>
        <Text style={styles.formSubtitle}>
          Enter your details to get started
        </Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter your username"
              placeholderTextColor={styles.placeholderColor.color}
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="email" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter your email"
              placeholderTextColor={styles.placeholderColor.color}
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter your password"
              placeholderTextColor={styles.placeholderColor.color}
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Confirm your password"
              placeholderTextColor={styles.placeholderColor.color}
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <MaterialIcons
                name={showConfirmPassword ? "visibility" : "visibility-off"}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.signupButton, loading && styles.signupButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.signupButtonText}>
            {loading ? "Creating..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigate.toLogin()}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Or Divider */}
        <Text style={styles.orText}>Or</Text>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleSignup}
          >
            <Image
              source={require("../../assets/images/google.png")}
              style={styles.socialIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleAppleSignup}
          >
            <Image
              source={require("../../assets/images/apple.png")}
              style={styles.socialIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Decoration */}
      <View style={styles.bottomDecoration}>
        <Image
          source={require("../../assets/images/pen.png")}
          style={styles.bottomPen}
        />
        <Image
          source={require("../../assets/images/pen.png")}
          style={styles.bottomPen}
        />
        <Image
          source={require("../../assets/images/pen.png")}
          style={styles.bottomPen}
        />
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
    alignItems: "center",
    justifyContent: "center",
  },

  // Header Section
  header: {
    alignItems: "center",
    paddingTop: 50,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 10,
    marginTop: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 6,
    fontFamily: "Jua-Regular",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Jua-Regular",
  },

  // Form Section
  formSection: {
    flex: 1,
    paddingTop: 15,
    alignItems: "center",
    paddingHorizontal: 46,
    width: "100%",
  },
  formTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    fontFamily: "Jua-Regular",
    alignSelf: "flex-start",
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontFamily: "Jua-Regular",
    alignSelf: "flex-start",
    fontWeight: "bold",
  },

  // Input Fields
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
  },
  inputIcon: {
    fontSize: 30,
    color: "#666",
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
    color: "#333",
  },
  eyeIcon: {
    fontSize: 24,
    color: "#666",
    marginLeft: 8,
  },
  placeholderColor: {
    color: "#999",
  },

  // Sign Up Button
  signupButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "75%",
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Login Section
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  loginLink: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
  },

  // Divider
  orText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },

  // Social Login Buttons
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    gap: 25,
  },
  socialButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    backgroundColor: "transparent",
    borderColor: COLORS.light,
  },
  socialIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  // Bottom Decoration
  bottomDecoration: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: -20,
    marginTop: 20,
  },
  bottomPen: {
    width: 156,
    height: 133,
    resizeMode: "contain",
    marginHorizontal: -15,
  },
});
