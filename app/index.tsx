import { COLORS, SIZES } from '@/constants/theme';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { navigate } from '../utils/navigation';
import React, { useEffect } from 'react';

export default function StartApp() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
 
  useEffect(() => {
     const timer = setTimeout(() => {
       if (isAuthenticated) {
         user?.role === 'admin' ? navigate.toAdminHome() : navigate.toUserHome();
       } else {
         navigate.toLogin();
       }
     }, 5000);
     return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);
 
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} />
           
      <View style={styles.textContainer}>
        <Text style={styles.studyAgent}>Study-Agent</Text>
        <Text style={styles.welcome}>Welcome to Study-Agent App</Text>
      </View>
 
      <Image source={require('../assets/images/clock.png')} style={styles.clock} />
           
      <View style={styles.pensContainer}>
        <Image source={require('../assets/images/pen.png')} style={styles.pen} />
        <Image source={require('../assets/images/pen.png')} style={styles.pen} />
        <Image source={require('../assets/images/pen.png')} style={styles.pen} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.skyLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    bottom: 30,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  studyAgent: {
    fontSize: 36,
    color: COLORS.blueDark,
    fontFamily: 'Jua-Regular', 
    fontWeight: '700', 
    marginBottom: 8,
  },
  welcome: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600', 
    fontFamily: 'Jua-Regular', 
  },
  clock: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    top: 20,
  },
  pensContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: -20, 
  },
  pen: {
    width: 156,
    height: 133,
    resizeMode: 'contain',
    marginHorizontal: -15, 
  },
});