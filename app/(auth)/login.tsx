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

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuthStore();

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

  const validateInput = (): boolean => {
    if (!username.trim()) {
      showToast('error', 'Please enter your username');
      return false;
    }
    
    if (!password.trim()) {
      showToast('error', 'Please enter your password');
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
        showToast('success', `Welcome back, ${currentUser.username}!`);
        
        // Navigate based on role
        if (currentUser.role === "ADMIN") {
          navigate.toAdminHome();
        } else {
          navigate.toUserHome();
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      showToast('error', message);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.subtitle}>Please login to your account!</Text>
      </View>

      {/* Login Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Login</Text>
        <Text style={styles.formSubtitle}>Enter your username and password</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="person" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter your username"
              placeholderTextColor={styles.placeholderColor.color}
              value={username}
              onChangeText={(text) => setUsername(text)}
              keyboardType="default"
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
            <Text style={styles.rememberText}>Remember</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate.toForgotPassword()}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "Signing in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigate.toRegister()}>
            <Text style={styles.signupLink}>Sign up</Text>
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
    paddingTop: 100,
    paddingBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 15,
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

  // Options Row (Remember & Forgot)
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    width: "100%",
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkIcon: {
    fontSize: 15,
    color: "white",
  },
  rememberText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  forgotText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },

  // Login Button
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  // Sign Up Section
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  signupText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  signupLink: {
    fontSize: 14,
    color: "#666",
    textDecorationLine: "underline",
  },


  // Bottom Decoration
  bottomDecoration: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: -20,
  },
  bottomPen: {
    width: 156,
    height: 133,
    resizeMode: "contain",
    marginHorizontal: -15,
  },
});
