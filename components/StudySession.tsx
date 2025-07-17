import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  AppStateStatus,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface MotivationMessage {
  title: string;
  message: string;
  icon: string;
}
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,
    priority: Notifications.AndroidNotificationPriority.HIGH
  }),
});

const MOTIVATION_MESSAGES: MotivationMessage[] = [
  {
    title: "🌟 Bạn đang làm tuyệt vời!",
    message: "Đã hoàn thành 20% phiên học. Tiếp tục nào!",
    icon: "star-outline"
  },
  {
    title: "🔥 Năng lượng tích cực!",
    message: "40% rồi! Momentum đang tăng dần đấy!",
    icon: "fire"
  },
  {
    title: "💪 Hơn nửa chặng đường!",
    message: "60% hoàn thành! Bạn thật kiên trì!",
    icon: "arm-flex-outline"
  },
  {
    title: "🚀 Gần đến đích rồi!",
    message: "80% rồi! Chỉ còn chút nữa thôi!",
    icon: "rocket-launch-outline"
  }
];

const WARNING_MESSAGES = {
  THREE_MINUTES: {
    title: "⏰ 3 phút cuối!",
    message: "Sắp hoàn thành rồi, hãy tập trung tối đa nhé!",
    icon: "timer-alert-outline"
  },
  ONE_MINUTE: {
    title: "🏁 1 phút cuối!",
    message: "Sprint cuối cùng! Bạn sắp thành công rồi!",
    icon: "flag-checkered"
  }
};

export default function StudySession(): React.JSX.Element {
  const router = useRouter(); 
  const params = useLocalSearchParams(); 

  const duration: number = parseInt(params.duration as string) || 10;
  const subject: string = params.subject as string;

  const [timeRemaining, setTimeRemaining] = useState<number>(duration * 60); 
  const [isActive, setIsActive] = useState<boolean>(true); 
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<typeof WARNING_MESSAGES.THREE_MINUTES | null>(null);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [outOfAppDuration, setOutOfAppDuration] = useState<number>(0);
  const [showMotivation, setShowMotivation] = useState<boolean>(false);
  const [currentMotivation, setCurrentMotivation] = useState<MotivationMessage | null>(null);
  const [motivationShown, setMotivationShown] = useState<Set<number>>(new Set());
  const notificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Refs
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCompletionPercentage = (): number => {
    return ((duration * 60 - timeRemaining) / (duration * 60)) * 100;
  };

  const showMotivationMessage = (motivation: MotivationMessage): void => {
    setCurrentMotivation(motivation);
    setShowMotivation(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      hideMotivationMessage();
    }, 4000);
  };

  const hideMotivationMessage = (): void => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowMotivation(false);
      setCurrentMotivation(null);
    });
  };

  useEffect(() => {
    const percentage = getCompletionPercentage();
    const milestones = [20, 40, 60, 80];
    
    milestones.forEach((milestone, index) => {
      if (percentage >= milestone && !motivationShown.has(milestone) && timeRemaining > 0) {
        setMotivationShown(prev => new Set([...prev, milestone]));
        showMotivationMessage(MOTIVATION_MESSAGES[index]);
      }
    });
  }, [timeRemaining]);

  // Warning messages for final minutes
  useEffect(() => {
    if (timeRemaining === 180 && timeRemaining > 0 && isActive) { // 3 minutes
      setWarningMessage(WARNING_MESSAGES.THREE_MINUTES);
      setShowWarning(true);
    } else if (timeRemaining === 60 && timeRemaining > 0 && isActive) { // 1 minute
      setWarningMessage(WARNING_MESSAGES.ONE_MINUTE);
      setShowWarning(true);
    } else if (timeRemaining > 180 || timeRemaining === 0) {
      setShowWarning(false);
      setWarningMessage(null);
    }
  }, [timeRemaining, isActive]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus): Promise<void> => {
    const currentTime = Date.now();
    
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App trở về foreground
      if (backgroundTimeRef.current) {
        const timeAway = Math.floor((currentTime - backgroundTimeRef.current) / 1000);
        
        // QUAN TRỌNG: Cập nhật thời gian còn lại
        setTimeRemaining(prev => {
          const newTime = prev - timeAway;
          return newTime > 0 ? newTime : 0;
        });
        
        setOutOfAppDuration(timeAway);
        
        // Hủy thông báo
        if (notificationIdRef.current) {
          await Notifications.dismissNotificationAsync(notificationIdRef.current);
          notificationIdRef.current = null;
        }
        if (notificationIntervalRef.current) {
          clearInterval(notificationIntervalRef.current);
          notificationIntervalRef.current = null;
        }
      }
      backgroundTimeRef.current = null;
    } else if (nextAppState.match(/inactive|background/)) {
      // App chuyển sang background
      backgroundTimeRef.current = currentTime;
      await sendBackgroundNotification();
      
      // Đặt interval gửi thông báo mỗi phút
      notificationIntervalRef.current = setInterval(async () => {
        if (timeRemaining > 0) {
          await sendBackgroundNotification();
        } else {
          if (notificationIntervalRef.current) {
            clearInterval(notificationIntervalRef.current);
            notificationIntervalRef.current = null;
          }
        }
      }, 1 * 60 * 1000); // Mỗi phút
    }
    
    appStateRef.current = nextAppState;
    setAppState(nextAppState);
  };

  const sendBackgroundNotification = async (): Promise<void> => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "📚 Phiên học đang diễn ra",
          body: `Còn ${formatTime(timeRemaining)} - Nhấn để quay lại và tiếp tục tập trung! 🎯`,
          data: { 
            screen: 'study-session',
            action: 'return_to_session'
          },
          sound: 'default',
          badge: 1,
        },
        trigger: null,
      });
      
      notificationIdRef.current = notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Listen to notification responses
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      if (response.notification.request.content.data?.action === 'return_to_session') {
        // App đã được mở lại từ notification
        console.log('User returned from notification');
      }
    });

    return () => subscription.remove();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
  
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1); 
      }, 1000); 
    } else if (timeRemaining === 0) {
      setIsActive(false);
      // Dừng notification interval khi hết giờ
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
        notificationIntervalRef.current = null;
      }
      handleSessionComplete();
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  const handleSessionComplete = (): void => {
    Alert.alert(
      "🎉 Chúc mừng!",
      "Bạn đã hoàn thành phiên học thành công! Thật tuyệt vời!",
      [
        {
          text: "Tuyệt vời! 🌟",
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleEndEarly = (): void => {
    setShowEndModal(true);
  };

  const confirmEndEarly = (): void => {
    setShowEndModal(false);
    router.back();
  };

  const cancelEndEarly = (): void => {
    setShowEndModal(false);
  };
  // Khi bắt đầu phiên học
useEffect(() => {
  const saveSession = async () => {
    await AsyncStorage.setItem('studySession', JSON.stringify({
      startTime: Date.now(),
      duration: duration * 60
    }));
  };
  
  saveSession();
}, []);

// Khi app khởi động lại
useEffect(() => {
  const restoreSession = async () => {
    const sessionData = await AsyncStorage.getItem('studySession');
    if (sessionData) {
      const { startTime, duration: totalDuration } = JSON.parse(sessionData);
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const newTimeRemaining = totalDuration - elapsedSeconds;
      
      setTimeRemaining(newTimeRemaining > 0 ? newTimeRemaining : 0);
    }
  };
  
  restoreSession();
}, []);

  useEffect(() => {
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
      // Xóa session storage khi component unmount
      AsyncStorage.removeItem('studySession');
    };
  }, []);
  const completionPercentage = getCompletionPercentage();
  const { width } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phiên học</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.mainContent}>
        {/* Enhanced Timer Circle with Progress */}
        <View style={styles.timerContainer}>
          <View style={styles.progressCircleContainer}>
            {/* Background Circle */}
            <View style={styles.backgroundCircle} />
            
            {/* Progress Circle - Enhanced */}
            <View style={[
              styles.progressCircle, 
              { 
                borderColor: showWarning && warningMessage ? "#FF6384" : "#4A90E2",
                transform: [{ rotate: `${(completionPercentage * 3.6) - 90}deg` }],
                shadowColor: showWarning && warningMessage ? "#FF6384" : "#4A90E2",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }
            ]} />
            
            {/* Timer Content */}
            <View style={[
              styles.timerContent,
              showWarning && warningMessage && styles.timerContentWarning
            ]}>
              <Text style={[
                styles.timerText,
                { color: showWarning && warningMessage ? "#FF6384" : "#333" }
              ]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.timerLabel}>còn lại</Text>
              
              {/* Progress Percentage */}
              <Text style={[
                styles.progressText,
                { color: showWarning && warningMessage ? "#FF6384" : "#4A90E2" }
              ]}>
                {Math.round(completionPercentage)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Enhanced Session Info */}
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>Phiên học: {subject}</Text>
          <Text style={styles.sessionDuration}>
            Thời gian cam kết: {duration} phút
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Enhanced Warning */}
        {showWarning && warningMessage && (
          <View style={[
            styles.warningContainer,
            timeRemaining <= 60 && styles.urgentWarning
          ]}>
            <View style={styles.warningIconContainer}>
              <MaterialCommunityIcons
                name={warningMessage.icon as any}
                size={32}
                color={timeRemaining <= 60 ? "#FF4444" : "#FF6384"}
              />
            </View>
            <View style={styles.warningContent}>
              <Text style={[
                styles.warningTitle,
                { color: timeRemaining <= 60 ? "#FF4444" : "#FF6384" }
              ]}>
                {warningMessage.title}
              </Text>
              <Text style={[
                styles.warningSubtitle,
                { color: timeRemaining <= 60 ? "#FF4444" : "#FF6384" }
              ]}>
                {warningMessage.message}
              </Text>
            </View>
          </View>
        )}

        {/* End Button */}
        <TouchableOpacity
          style={styles.endButton}
          onPress={handleEndEarly}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="stop-circle-outline" size={24} color="#FFF" />
          <Text style={styles.endButtonText}>Kết thúc phiên học</Text>
        </TouchableOpacity>
        
        {/* Enhanced Motivation Text */}
        <Text style={styles.motivationText}>
          {completionPercentage < 20 ? "🌱 Bạn đã bắt đầu rồi! Tuyệt vời!" :
           completionPercentage < 50 ? "🔥 Momentum đang tăng dần!" :
           completionPercentage < 80 ? "💪 Hơn nửa chặng đường rồi!" :
           "🚀 Sắp đến đích rồi! Cố lên!"}
        </Text>
      </View>

      {/* Motivation Modal */}
      {showMotivation && currentMotivation && (
        <Animated.View 
          style={[
            styles.motivationModal,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.motivationContent}
            onPress={hideMotivationMessage}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons
              name={currentMotivation.icon as any}
              size={40}
              color="#4A90E2"
            />
            <Text style={styles.motivationTitle}>
              {currentMotivation.title}
            </Text>
            <Text style={styles.motivationMessage}>
              {currentMotivation.message}
            </Text>
            <Text style={styles.motivationTap}>Nhấn để đóng</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Enhanced End Confirmation Modal */}
      <Modal
        visible={showEndModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelEndEarly}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIcon}>
              <MaterialCommunityIcons 
                name="alert-circle-outline" 
                size={48} 
                color="#FF6384" 
              />
            </View>
            
            <Text style={styles.modalTitle}>⚠️ Kết thúc sớm?</Text>
            <Text style={styles.modalMessage}>
              Bạn đã hoàn thành {Math.round(completionPercentage)}% phiên học. 
              Thật tiếc nếu dừng lại bây giờ! 
              {completionPercentage > 80 && "\n\n🔥 Bạn đã gần hoàn thành rồi!"}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={cancelEndEarly}
              >
                <MaterialCommunityIcons name="arrow-left" size={18} color="#4A90E2" />
                <Text style={styles.modalButtonCancelText}>Tiếp tục học</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonConfirm}
                onPress={confirmEndEarly}
              >
                <MaterialCommunityIcons name="stop" size={18} color="#FFF" />
                <Text style={styles.modalButtonConfirmText}>Kết thúc</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", 
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50, 
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700", 
    color: "#333",
  },
  headerSpacer: {
    width: 32,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    alignItems: "center",
  },
  progressCircleContainer: {
    position: 'relative',
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 10,
    borderColor: '#E8E8E8',
  },
  progressCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 10,
    borderColor: '#4A90E2',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  timerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: 190,
    height: 190,
    borderRadius: 95,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  timerContentWarning: {
    borderWidth: 2,
    borderColor: '#FF6384',
  },
  timerText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#333",
  },
  timerLabel: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
    marginTop: 8,
  },
  sessionInfo: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    textAlign: 'center',
  },
  sessionDuration: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  awayTime: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 8,
    fontWeight: '500',
  },
  bottomSection: {
    paddingBottom: 40, 
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FED7E2",
  },
  urgentWarning: {
    backgroundColor: "#FFF0F0",
    borderColor: "#FF4444",
    shadowColor: "#FF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  warningIconContainer: {
    marginRight: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF6384", 
  },
  warningSubtitle: {
    fontSize: 14,
    color: "#FF6384",
    marginTop: 4,
  },
  endButton: {
    backgroundColor: "#FF6384",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    shadowColor: "#FF6384",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  endButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: 8,
  },
  motivationText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    fontWeight: '500',
  },
  logo: {
    width: 32,
    height: 32,
  },
  
  // Motivation Modal Styles
  motivationModal: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  motivationContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#E3F2FD',
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  motivationTap: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 6,
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#FF6384',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
});