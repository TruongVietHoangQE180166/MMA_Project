import { create } from 'zustand';
import { AuthState } from '../types';
import { mockLogin, mockRegister, mockResetPassword } from '../services/mockApi';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    const { user, token } = await mockLogin(email, password);
    set({ user, token, isAuthenticated: true });
  },
  
  register: async (email: string, password: string) => {
    await mockRegister(email, password);
  },
  
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  resetPassword: async (email: string) => {
    await mockResetPassword(email);
  },
}));