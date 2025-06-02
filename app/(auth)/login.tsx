import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, Image, TextInput, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SIZES } from '../../constants/theme';
import { navigate } from '../../utils/navigation';
import { MaterialIcons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      const { user } = useAuthStore.getState();
      user?.role === 'admin' ? navigate.toAdminHome() : navigate.toUserHome();
    } catch (error) {
      Alert.alert('Error', 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Login', 'Google login functionality to be implemented');
  };

  const handleAppleLogin = () => {
    Alert.alert('Apple Login', 'Apple login functionality to be implemented');
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
        <Text style={styles.subtitle}>Please login to your account!</Text>
      </View>

      {/* Login Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Login</Text>
        <Text style={styles.formSubtitle}>Enter your email and password</Text>
        
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
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter your password"
              placeholderTextColor={styles.placeholderColor.color}
              value={password}
              onChangeText={setPassword}
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
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
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

        {/* Or Divider */}
        <Text style={styles.orText}>Or</Text>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={handleGoogleLogin}
          >
            <Image 
              source={require('../../assets/images/google.png')} 
              style={styles.socialIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton}
            onPress={handleAppleLogin}
          >
            <Image 
              source={require('../../assets/images/apple.png')} 
              style={styles.socialIcon}
            />
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
    fontSize: 14,
    color: '#333',
  },
  eyeIcon: {
    fontSize: 24,
    color: '#666',
    marginLeft: 8,
  },
  placeholderColor: {
    color: '#999',
  },
  
  // Options Row (Remember & Forgot)
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkIcon: {
    fontSize: 15,
    color: 'white',
  },
  rememberText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  
  // Login Button
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Sign Up Section
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  signupLink: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  
  // Divider
  orText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  
  // Social Login Buttons
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 25,
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderColor: COLORS.light,
  },
  socialIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
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