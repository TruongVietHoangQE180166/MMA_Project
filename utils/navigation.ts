import { router } from 'expo-router';

export const navigate = {
  toLogin: () => router.replace('/(auth)/login' as any),
  toRegister: () => router.push('/(auth)/register' as any),
  toForgotPassword: () => router.push('/(auth)/forgot-password' as any),
  toEmailSent: (email: string) => router.push({ pathname: '/(auth)/email-sent', params: { email } } as any),
  toEmailSentReset: (email: string) => router.push({ pathname: '/(auth)/email-sent-reset', params: { email } } as any),
  toResetPassword: (otp: string, email: string) => {
    console.log("Navigating with params:", { otp, email });
    router.push({
      pathname: '/(auth)/reset-password',
      params: {
        otp: otp,
        email: email
      }
    });
  },
  toUserHome: () => router.replace('/(user)/home' as any),
  toAdminHome: () => router.replace('/(admin)/home' as any),
  toHome: () => router.replace('/' as any),
  back: () => router.back(),
};