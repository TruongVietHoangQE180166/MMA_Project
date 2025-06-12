import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { authApi, forgotPassword, resetPassword } from "../services/authApi";
import { AuthState } from "../types";

const initializeAuthState = async (): Promise<Partial<AuthState>> => {
  try {
    const token = await AsyncStorage.getItem("token");
    const userString = await AsyncStorage.getItem("user");
    if (token && userString) {
      const user = JSON.parse(userString);
      return {
        user,
        token,
        isAuthenticated: !!user && !!token,
      };
    }
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  } catch (error) {
    console.error("Failed to initialize auth state:", error);
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    try {
      const token = await authApi.login(username, password);
      const user = await authApi.getUserDetail(token);
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
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
      set({ user: null, token: null, isAuthenticated: false });
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
}));

initializeAuthState().then((initialState) => {
  useAuthStore.setState(initialState);
});