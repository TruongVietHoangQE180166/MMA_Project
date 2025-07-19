import { COLORS, FONTS } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, Modal, ActivityIndicator, TouchableOpacity, BackHandler, Dimensions } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { navigate } from '../utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Theme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;
const isSmallScreen = screenHeight < 700;

export default function StartApp() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [modal, setModal] = useState<{ show: boolean, type: 'resume' | 'ended' | null }>({ show: false, type: null });
  const [noInternet, setNoInternet] = useState(false);
  const { theme } = useTheme();
  const [checkedOnboarding, setCheckedOnboarding] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái onboarding
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!isAuthenticated && seen !== 'true') {
        router.replace('/onboarding');
        return;
      }
      setCheckedOnboarding(true);
    };
    checkOnboarding();
  }, [isAuthenticated]);

  // Đừng return null ở đây nữa!
  // if (!checkedOnboarding) return null;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNoInternet(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (noInternet) return;
    const timer = setTimeout(async () => {
      if (isAuthenticated) {
        if (user?.role === 'USER') {
          // Check resume study session
          const sessionStr = await AsyncStorage.getItem('CURRENT_STUDY_SESSION');
          if (sessionStr) {
            try {
              const session = JSON.parse(sessionStr);
              const now = Date.now();
              const elapsed = Math.floor((now - session.startTime) / 1000);
              const remaining = session.duration - elapsed;
              if (remaining > 0) {
                setModal({ show: true, type: 'resume' });
                setTimeout(() => {
                  setModal({ show: false, type: null });
                  router.replace({
                    pathname: '/(user)/StudySession',
                    params: {
                      duration: Math.ceil(remaining / 60).toString(),
                      subject: session.subject,
                      sessionKey: session.sessionKey,
                      remainingSeconds: remaining.toString(),
                      sessionId: session.sessionId,
                      aiEnabled: (session.aiEnabled === true ? 'true' : 'false'),
                    },
                  });
                }, 3000);
                return;
              } else {
                setModal({ show: true, type: 'ended' });
                setTimeout(async () => {
                  setModal({ show: false, type: null });
                  await AsyncStorage.removeItem('CURRENT_STUDY_SESSION');
                  navigate.toUserHome();
                }, 3000);
                return;
              }
            } catch (e) {
              await AsyncStorage.removeItem('CURRENT_STUDY_SESSION');
            }
          }
          navigate.toUserHome();
        } else if (user?.role === 'ADMIN') {
          navigate.toAdminHome();
        } else {
          navigate.toLogin();
        }
      } else {
        navigate.toLogin();
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, noInternet]);

  const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
  
    // Background decorations
    decorationCircle1: {
      position: 'absolute',
      top: screenHeight * -0.05,
      right: screenWidth * -0.1,
      width: isTablet ? 280 : 200,
      height: isTablet ? 280 : 200,
      borderRadius: isTablet ? 140 : 100,
      backgroundColor: 'rgba(46, 134, 193, 0.08)',
    },
    decorationCircle2: {
      position: 'absolute',
      bottom: screenHeight * 0.2,
      left: screenWidth * -0.15,
      width: isTablet ? 220 : 160,
      height: isTablet ? 220 : 160,
      borderRadius: isTablet ? 110 : 80,
      backgroundColor: 'rgba(52, 152, 219, 0.06)',
    },
    decorationCircle3: {
      position: 'absolute',
      top: screenHeight * 0.25,
      left: screenWidth * 0.05,
      width: isTablet ? 180 : 120,
      height: isTablet ? 180 : 120,
      borderRadius: isTablet ? 90 : 60,
      backgroundColor: 'rgba(174, 214, 241, 0.12)',
    },

    // Main content
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    // Logo section
    logoSection: {
      alignItems: 'center',
      marginBottom: isSmallScreen ? 40 : isTablet ? 100 : 80,
    },
    logoContainer: {
      position: 'relative',
      marginBottom: isTablet ? 40 : 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: isTablet ? 180 : isSmallScreen ? 120 : 140,
      height: isTablet ? 180 : isSmallScreen ? 120 : 140,
      resizeMode: 'contain',
      zIndex: 2,
    },
    logoBorder: {
      position: 'absolute',
      width: isTablet ? 200 : isSmallScreen ? 140 : 160,
      height: isTablet ? 200 : isSmallScreen ? 140 : 160,
      borderRadius: isTablet ? 100 : isSmallScreen ? 70 : 80,
      borderWidth: 3,
      borderColor: 'rgba(46, 134, 193, 0.15)',
      zIndex: 1,
    },
    
    textContainer: {
      alignItems: 'center',
    },
    studyAgent: {
      fontSize: isTablet ? 48 : isSmallScreen ? 32 : 38,
      color: theme.colors.primary,
      fontFamily: FONTS.juaRegular, 
      fontWeight: '800', 
      marginBottom: 8,
      letterSpacing: 0.5,
      textShadowColor: theme.colors.shadowColor,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    welcome: {
      fontSize: isTablet ? 20 : isSmallScreen ? 14 : 16,
      color: theme.colors.textSecondary,
      fontWeight: '500', 
      fontFamily: FONTS.juaRegular,
      marginBottom: 12,
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    underline: {
      width: isTablet ? 80 : 60,
      height: isTablet ? 4 : 3,
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },

    // Clock section
    clockSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: isTablet ? 60 : 40,
    },
    clockContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    clock: {
      width: isTablet ? 180 : isSmallScreen ? 110 : 130,
      height: isTablet ? 180 : isSmallScreen ? 110 : 130,
      resizeMode: 'contain',
      zIndex: 2,
    },
    clockGlow: {
      position: 'absolute',
      width: isTablet ? 200 : isSmallScreen ? 130 : 150,
      height: isTablet ? 200 : isSmallScreen ? 130 : 150,
      borderRadius: isTablet ? 100 : isSmallScreen ? 65 : 75,
      backgroundColor: theme.colors.primary + '08',
      zIndex: 1,
    },

    // Bottom decoration
    bottomDecoration: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: isTablet ? 200 : isSmallScreen ? 120 : 150,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    pensContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-end',
      gap: isTablet ? -35 : -25,
      marginBottom: isTablet ? 15 : 10,
    },
    penWrapper: {
      alignItems: 'center',
    },
    pen: {
      width: isTablet ? 180 : isSmallScreen ? 120 : 140,
      height: isTablet ? 160 : isSmallScreen ? 100 : 120,
      resizeMode: 'contain',
    },
    bottomGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },

    // Loading indicator
    loadingContainer: {
      alignItems: 'center',
      marginTop: isTablet ? 60 : isSmallScreen ? 30 : 40,
    },
    loadingText: {
      marginTop: 12,
      fontSize: isTablet ? 16 : 14,
      color: theme.colors.primary,
      fontWeight: '500',
      letterSpacing: 0.5,
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: 24,
      padding: isTablet ? 40 : 32,
      alignItems: 'center',
      minWidth: isTablet ? 400 : 300,
      maxWidth: isTablet ? 500 : 360,
      shadowColor: theme.colors.shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
    modalIconContainer: {
      marginBottom: isTablet ? 24 : 20,
      padding: isTablet ? 12 : 8,
      borderRadius: 50,
      backgroundColor: 'rgba(46, 134, 193, 0.08)',
    },
    modalTitle: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: '700',
      marginBottom: isTablet ? 16 : 12,
      textAlign: 'center',
      letterSpacing: 0.3,
      color: theme.colors.primary,
    },
    modalMessage: {
      fontSize: isTablet ? 18 : 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: isTablet ? 26 : 22,
      marginBottom: isTablet ? 32 : 24,
    },
    progressBarContainer: {
      width: '100%',
      height: 4,
      backgroundColor: 'rgba(46, 134, 193, 0.1)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      width: '100%',
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    exitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.error,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 12,
      gap: 8,
      marginTop: 8,
      shadowColor: theme.colors.error,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    exitButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
      fontSize: 16,
      letterSpacing: 0.3,
    },
  });
  const styles = createStyles(theme);

  // Nếu chưa kiểm tra xong onboarding thì render loading
  if (!checkedOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
 
  return (
    <LinearGradient
      colors={[theme.colors.background, theme.colors.surface, theme.colors.surfaceVariant]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background decoration circles */}
      <View style={styles.decorationCircle1} />
      <View style={styles.decorationCircle2} />
      <View style={styles.decorationCircle3} />
      
      {/* Main content */}
      <View style={styles.contentContainer}>
        {/* Logo section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            <View style={styles.logoBorder} />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.studyAgent}>Study Agent</Text>
            <Text style={styles.welcome}>Your Smart Learning Companion</Text>
            <View style={styles.underline} />
          </View>
        </View>

        {/* Clock section */}
        <View style={styles.clockSection}>
          <View style={styles.clockContainer}>
            <Image source={require('../assets/images/clock.png')} style={styles.clock} />
            <View style={styles.clockGlow} />
          </View>
          
          {/* Loading indicator below clock */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E86C1" />
            <Text style={styles.loadingText}>Initializing...</Text>
          </View>
        </View>
      </View>

      {/* Bottom decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.pensContainer}>
          <View style={styles.penWrapper}>
            <Image source={require('../assets/images/pen.png')} style={styles.pen} />
          </View>
          <View style={styles.penWrapper}>
            <Image source={require('../assets/images/pen.png')} style={styles.pen} />
          </View>
          <View style={styles.penWrapper}>
            <Image source={require('../assets/images/pen.png')} style={styles.pen} />
          </View>
        </View>
      </View>

      {/* Modal thông báo phiên học */}
      <Modal visible={modal.show} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              {modal.type === 'resume' && (
                <MaterialIcons name="play-circle-filled" size={56} color="#2E86C1" />
              )}
              {modal.type === 'ended' && (
                <MaterialIcons name="check-circle" size={56} color="#E74C3C" />
              )}
            </View>
            
            <Text style={[styles.modalTitle, { 
              color: modal.type === 'resume' ? '#2E86C1' : '#E74C3C' 
            }]}>
              {modal.type === 'resume' ? 'Study Session Found' : 'Session Completed'}
            </Text>
            
            <Text style={styles.modalMessage}>
              {modal.type === 'resume'
                ? 'Resuming your ongoing study session...'
                : 'Great job! Returning to home...'}
            </Text>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { 
                backgroundColor: modal.type === 'resume' ? '#2E86C1' : '#E74C3C' 
              }]} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for no internet connection */}
      <Modal visible={noInternet} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="wifi-off" size={56} color="#E74C3C" />
            </View>
            
            <Text style={[styles.modalTitle, { color: '#E74C3C' }]}>
              Connection Lost
            </Text>
            
            <Text style={styles.modalMessage}>
              Please check your internet connection to continue using the app.
            </Text>
            
            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => BackHandler.exitApp()}
            >
              <MaterialIcons name="exit-to-app" size={20} color="#FFFFFF" />
              <Text style={styles.exitButtonText}>Exit App</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}