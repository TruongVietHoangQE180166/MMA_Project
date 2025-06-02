import { router } from 'expo-router';

export const navigate = {
  toLogin: () => router.replace('/(auth)/login' as any),
  toRegister: () => router.push('/(auth)/register' as any),
  toForgotPassword: () => router.push('/(auth)/forgot-password' as any),
  toEmailSent: () => router.push('/(auth)/email-sent' as any),
  toResetPassword: () => router.push('/(auth)/reset-password' as any),
  toUserHome: () => router.replace('/(user)/home' as any),
  toAdminHome: () => router.replace('/(admin)/home' as any),
  toHome: () => router.replace('/' as any),
  back: () => router.back(),
};