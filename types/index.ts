export interface User {
  email: string;
  username: string;
  role: "USER" | "ADMIN";
}

export interface VerifyOTP {
  email: string;
  otp: string;
}

export interface UserProfile {
  nickName: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string; 
  avatar: string;
  gender: "MALE" | "FEMALE";
}

export interface UploadFile {
  uri: string;
  type?: string;
  name?: string;
}


export interface AuthState {
  user: User | null;
  token: string | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>; 
  register: (username: string, email: string, password: string, repassword: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string, username: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  getUserProfile: (forceRefresh?: boolean) => Promise<UserProfile>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
  updateProfileWithImage: (
    profileData: Partial<UserProfile>, 
    imageFile?: UploadFile
  ) => Promise<UserProfile>;
}