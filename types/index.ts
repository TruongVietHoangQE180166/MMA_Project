export interface User {
  email: string;
  username: string;
  role: "USER" | "ADMIN";
}

export interface VerifyOTP {
  email: string;
  otp: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>; 
  register: (username: string, email: string, password: string, repassword: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string, username: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}