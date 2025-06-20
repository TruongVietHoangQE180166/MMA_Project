import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthButton } from '../components/AuthButton';
import { COLORS } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export default function UserProfile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    password: ''
  });

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = () => {
    // Handle profile update logic here
    console.log('Update profile:', formData);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
  <Image 
    source={require('../../assets/images/logo.png')} 
    style={styles.logoImage} 
    resizeMode="cover" 
  />
</View>
        <Text style={styles.title}>Study-Agent</Text>
        <Text style={styles.subtitle}>View and edit your profile</Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarBackground}>
            <MaterialIcons name="person" size={55} color="#9CA3AF" />
          </View>
          <View style={styles.editIcon}>
            <MaterialIcons name="edit" size={16} color="#fff" />
          </View>
        </View>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        {/* Name Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="person-outline" size={18} color={COLORS.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholderTextColor={COLORS.secondary}
            />
          </View>
        </View>

        {/* Email Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={18} color={COLORS.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholderTextColor={COLORS.secondary}
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock-outline" size={18} color={COLORS.secondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholderTextColor={COLORS.secondary}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <MaterialIcons 
                name={showPassword ? "visibility" : "visibility-off"} 
                size={18} 
                color={COLORS.secondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Update Button */}
        <View style={styles.updateButtonContainer}>
          <AuthButton 
            title="Update Profile" 
            onPress={handleUpdateProfile}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0FA",
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: "#E6F0FA",
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff6b9d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 25,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarBackground: {
    width: 110,
    height: 110,
    borderRadius: 80,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  updateButtonContainer: {
    marginTop: 15,
    marginBottom: 12,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    color: '#ff6b9d',
    fontSize: 14,
    fontWeight: '500',
  },
  logoImage: {
  width: "100%",
  height: "100%",
  borderRadius: 40, 
},

});