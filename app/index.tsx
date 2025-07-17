import { COLORS, FONTS } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, Modal, ActivityIndicator, TouchableOpacity, BackHandler } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { navigate } from '../utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

export default function StartApp() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [modal, setModal] = useState<{ show: boolean, type: 'resume' | 'ended' | null }>({ show: false, type: null });
  const [noInternet, setNoInternet] = useState(false);
 
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
                      sessionId: session.sessionId, // truyền sessionId nếu có
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
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, noInternet]);
 
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
     {/* Modal thông báo phiên học */}
     <Modal visible={modal.show} transparent animationType="fade">
       <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
         <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', minWidth: 280, maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 }}>
           {modal.type === 'resume' && <MaterialIcons name="play-circle-filled" size={48} color="#4A90E2" style={{ marginBottom: 16 }} />}
           {modal.type === 'ended' && <MaterialIcons name="check-circle" size={48} color="#FF6B6B" style={{ marginBottom: 16 }} />}
           <Text style={{ fontSize: 18, fontWeight: 'bold', color: modal.type === 'resume' ? '#4A90E2' : '#FF6B6B', marginBottom: 8, textAlign: 'center' }}>
             {modal.type === 'resume' ? 'You have an ongoing study session' : 'The study session has ended'}
           </Text>
           <Text style={{ fontSize: 15, color: '#333', textAlign: 'center', marginBottom: 16 }}>
             {modal.type === 'resume'
               ? 'You will be redirected to your study session in 3 seconds...'
               : 'The session has ended, returning to home in 3 seconds.'}
           </Text>
           <ActivityIndicator size="small" color={modal.type === 'resume' ? '#4A90E2' : '#FF6B6B'} style={{ marginTop: 8 }} />
         </View>
       </View>
     </Modal>

    {/* Modal for no internet connection */}
    <Modal visible={noInternet} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', minWidth: 280, maxWidth: 340, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 }}>
          <MaterialIcons name="wifi-off" size={48} color="#FF6B6B" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B6B', marginBottom: 8 }}>
            No Internet Connection
          </Text>
          <Text style={{ fontSize: 15, color: '#333', textAlign: 'center', marginBottom: 16 }}>
            Please check your network connection and try again.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#FF6B6B', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginTop: 8 }}
            onPress={() => BackHandler.exitApp()}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Exit App</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    fontFamily: FONTS.juaRegular, 
    fontWeight: '700', 
    marginBottom: 8,
  },
  welcome: {
    fontSize: 14,
    color: COLORS.dark,
    fontWeight: '600', 
    fontFamily: FONTS.juaRegular, 
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