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
import Toast from "react-native-toast-message";
import { COLORS } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";
import { navigate } from "../../utils/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuthStore();

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Study-Agent</Text>
        <Text style={styles.subtitle}>Don't worry, we'll help you!</Text>
      </View>

      {/* Forgot Password Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Forgot Password?</Text>
        <Text style={styles.formSubtitle}>
          Enter your username and email to reset your password
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
              keyboardType="default"
              autoCapitalize="none"
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
              keyboardType="default"
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
    paddingTop: 50,
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

  // Reset Button
  resetButton: {
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
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
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
