import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { authApi, forgotPassword, resetPassword } from "../services/authApi";
import { AuthState, UserProfile } from "../types";
import { jwtDecode } from 'jwt-decode';

function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

const initializeAuthState = async (): Promise<Partial<AuthState>> => {
  try {
    const token = await AsyncStorage.getItem("token");
    const userString = await AsyncStorage.getItem("user");
    const userProfileString = await AsyncStorage.getItem("userProfile"); 
    
    if (token && userString) {
      // Kiểm tra token hết hạn
      if (isTokenExpired(token)) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("userProfile");
        return {
          user: null,
          userProfile: null,
          token: null,
          isAuthenticated: false,
        };
      }
      const user = JSON.parse(userString);
      const userProfile = userProfileString ? JSON.parse(userProfileString) : null;
      return {
        user,
        userProfile,
        token,
        isAuthenticated: !!user && !!token,
      };
    }
    return {
      user: null,
      userProfile: null,
      token: null,
      isAuthenticated: false,
    };
  } catch (error) {

    return {
      user: null,
      userProfile: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null, 
  token: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    try {
      const token = await authApi.login(username, password);
      const user = await authApi.getUserDetail(token);
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
      try {
        const userProfile = await authApi.getUserProfile(token);
        await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));
        set({ userProfile });
      } catch (profileError) {

      }
    } catch (error: any) {
      throw new Error(error.message || "Invalid credentials");
    }
  },

  verifyOTP: async (email: string, otp: string) => {
    try {
      await authApi.verifyOTP(email, otp);
    } catch (error: any) {
      throw new Error(error.message || "OTP verification failed");
    }
  },

  register: async (username: string, email: string, password: string, repassword: string) => {
    try {
      await authApi.register(username, email, password, repassword);
    } catch (error: any) {
      throw new Error(error.message || "Registration failed");
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userProfile"); 
      set({ user: null, userProfile: null, token: null, isAuthenticated: false });
    } catch (error: any) {
      throw new Error(error.message || "Logout failed");
    }
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    try {
      await resetPassword(email, otp, newPassword);
    } catch (error: any) {
      throw new Error(error.message || "Password reset failed");
    }
  },

  forgotPassword: async (email: string, username: string) => {
    try {
      await forgotPassword(email, username);
    } catch (error: any) {
      throw new Error(error.message || "Forgot password request failed");
    }
  },

  refreshUserData: async () => {
    try {
      const { token } = get();
      if (!token) {
        throw new Error("No token available");
      }

      const user = await authApi.getUserDetail(token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      set({ user });
    } catch (error: any) {
      throw new Error(error.message || "Failed to refresh user data");
    }
  },

  getUserProfile: async (forceRefresh: boolean = false) => {
    try {
      const { token } = get();
      if (!token) {
        throw new Error("No token available");
      }
  
      const userProfile = await authApi.getUserProfile(token);
      await AsyncStorage.setItem("userProfile", JSON.stringify(userProfile));
      set({ userProfile });
      return userProfile;
    } catch (error: any) {
      throw new Error(error.message || "Failed to get user profile");
    }
  },
  updateProfile: async (profileData: Partial<UserProfile>) => {
    try {
      const { token } = get();
      if (!token) {
        throw new Error("No token available");
      }
      
      const updatedProfile = await authApi.updateProfile(token, profileData);
      
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      set({ userProfile: updatedProfile });
      
      return updatedProfile;
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile");
    }
  },
  
  updateProfileWithImage: async (profileData: Partial<UserProfile>, imageFile?: any) => {
    try {
      const { token } = get();
      if (!token) {
        throw new Error("No token available");
      }
      
      let finalProfileData = { ...profileData };
      
      if (imageFile && imageFile.uri) {
        try {
          const imageUrl = await authApi.uploadImage(token, imageFile);
          finalProfileData.avatar = imageUrl;
        } catch (uploadError) {
          const errMsg = uploadError instanceof Error ? uploadError.message : String(uploadError);
          throw new Error(`Image upload failed: ${errMsg}`);
        }
      }
      
      const updatedProfile = await authApi.updateProfile(token, finalProfileData);
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      set({ userProfile: updatedProfile });
      
      return updatedProfile;
      
    } catch (error: any) {
      throw new Error(error.message || "Failed to update profile with image");
    }
  },
}));

initializeAuthState().then((initialState) => {
  useAuthStore.setState(initialState);
}).catch((error) => {
  console.error('Failed to initialize auth state:', error);
  useAuthStore.setState({
    user: null,
    userProfile: null,
    token: null,
    isAuthenticated: false,
  });
});
