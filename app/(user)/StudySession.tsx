import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { View, Text, Button, Modal, AppState, BackHandler, StyleSheet, TouchableOpacity, Platform, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Notifications from "expo-notifications";
import { useKeepAwake } from "expo-keep-awake";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSessionStore } from "../../store/sessionStore";
import { useTheme } from '../../contexts/ThemeContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { AppStateStatus } from 'react-native';

const { width, height } = Dimensions.get('window');

// Types
interface StudySessionStats {
  totalBackgroundTime: number;
  backgroundExitCount: number;
  violationCount: number;
  completedPercent: number;
  totalStudyTime: number;
  backgroundLogs: { time: string; duration: number }[]; 
}

export default function StudySession() {
  useKeepAwake();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  // Bỏ lấy sessionId từ params, chỉ lấy sessionKey nếu cần
  const { duration = "60", subject = "", sessionKey = "0", remainingSeconds, sessionId: sessionIdFromParams, isNewSession, aiEnabled = "false" } = useLocalSearchParams();
  const hasAIEnabled = useMemo(() => aiEnabled === "true", [aiEnabled]);
  console.log('PARAM aiEnabled:', aiEnabled);
  console.log('hasAIEnabled:', hasAIEnabled);
  const { initialRemaining, initialStartTimestamp } = useMemo(() => {
    const totalStudyTime = Number(duration) * 60;
    const remaining = remainingSeconds ? Number(remainingSeconds) : totalStudyTime;
    const startTs = remainingSeconds
      ? Date.now() - (totalStudyTime - Number(remainingSeconds)) * 1000
      : Date.now();
    return { initialRemaining: remaining, initialStartTimestamp: startTs };
  }, [duration, remainingSeconds, sessionKey]);

  const totalStudyTime = useMemo(() => Number(duration) * 60, [duration]);
  const defaultStats: StudySessionStats = {
    totalBackgroundTime: 0,
    backgroundExitCount: 0,
    violationCount: 0,
    completedPercent: 0,
    totalStudyTime: Number(duration) * 60,
    backgroundLogs: [],
  };
  const MILESTONES = [0.2, 0.4, 0.6, 0.8];
  const [remaining, setRemaining] = useState(initialRemaining);
  const [initialStartTimestampState, setInitialStartTimestampState] = useState(initialStartTimestamp);
  const [stats, setStatsRaw] = useState<StudySessionStats>(defaultStats);
  const [hasLoadedStats, setHasLoadedStats] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [milestoneIdx, setMilestoneIdx] = useState<number | null>(null);
  const [milestonesShown, setMilestonesShown] = useState<boolean[]>(MILESTONES.map(() => false));
  const [endModal, setEndModal] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [alertModal, setAlertModal] = useState<{ show: boolean; type: '3m' | '1m' | null }>({ show: false, type: null });
  const bgStart = useRef<number | null>(null);
  const timer = useRef<number | null>(null);
  const ended = useRef(false);
  const startTimestamp = useRef<number>(initialStartTimestamp);
  const lastActiveTimestamp = useRef<number>(Date.now());
  const totalForegroundTime = useRef<number>(0);
  const [hasNotifPermission, setHasNotifPermission] = useState(false);
  const { applyPenalty, endEarlySession } = useSessionStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const justRestoredFromKill = useRef(false);
  const [penaltyModal, setPenaltyModal] = useState<{ show: boolean; duration: number } | null>(null);

  // AI Camera states (logic tối ưu)
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [aiSocket, setAiSocket] = useState<WebSocket | null>(null);
  const [aiAbsentStart, setAiAbsentStart] = useState<number | null>(null);
  const [aiAbsentTime, setAiAbsentTime] = useState<number>(0);
  const [aiPresenceWarningModal, setAiPresenceWarningModal] = useState(false);
  const [aiWarningModal, setAiWarningModal] = useState<{ show: boolean; duration: number } | null>(null);
  const [showCameraPreview, setShowCameraPreview] = useState(false);

  // Khi mount, luôn lấy sessionId từ params nếu có, nếu không thì lấy từ AsyncStorage
  useEffect(() => {
    if (sessionIdFromParams) {
      setSessionId(sessionIdFromParams as string);
      return;
    }
    (async () => {
      const sessionStr = await AsyncStorage.getItem("CURRENT_STUDY_SESSION");
      if (sessionStr) {
        try {
          const sessionObj = JSON.parse(sessionStr);
          if (sessionObj.sessionId) setSessionId(sessionObj.sessionId);
          else {
            alert("Không tìm thấy sessionId. Về trang chủ.");
            router.replace("/(user)/home");
          }
        } catch {
          alert("Lỗi đọc dữ liệu phiên học. Về trang chủ.");
          router.replace("/(user)/home");
        }
      } else {
        alert("Không có phiên học active. Về trang chủ.");
        router.replace("/(user)/home");
      }
    })();
  }, [sessionIdFromParams]);
  
  // Tạo hàm startTimer để có thể gọi lại khi cần
  const startTimer = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    
    timer.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimestamp.current) / 1000);
      const newRemaining = Math.max(totalStudyTime - elapsed, 0);
      setRemaining(newRemaining);
      
      // Cập nhật % hoàn thành
      setStats((s) => ({
        ...s,
        completedPercent: Math.min(100, Math.round(((elapsed) / totalStudyTime) * 100)),
      }));
      
      if (newRemaining <= 0) {
        if (timer.current) clearInterval(timer.current);
        handleEndSession();
      }
    }, 1000) as unknown as number;
  }, [totalStudyTime]);

  // Đọc lại stats cũ từ AsyncStorage khi mount (nếu có)
  useEffect(() => {
    (async () => {
      const statsStr = await AsyncStorage.getItem('CURRENT_STUDY_SESSION_STATS_' + sessionKey);
      if (statsStr) {
        try {
          const oldStats = JSON.parse(statsStr);
          setStatsRaw(() => oldStats);
          setHasLoadedStats(true);
        } catch {
          setHasLoadedStats(false);
        }
      } else {
        setHasLoadedStats(false);
      }
      setIsLoading(false);
    })();
  }, [sessionKey]);
  
  // setStats sẽ luôn lưu vào AsyncStorage
  const setStats = (updater: (s: StudySessionStats) => StudySessionStats) => {
    setStatsRaw((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem('CURRENT_STUDY_SESSION_STATS_' + sessionKey, JSON.stringify(next));
      return next;
    });
  };

  // Xin quyền notification và tạo channel Android khi vào màn
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      setHasNotifPermission(status === 'granted');
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('study-session', {
          name: 'Study Session',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
    })();
  }, []);

  // Reset state khi unmount hoặc khi tạo session mới
  useEffect(() => {
    setIsLoading(true);
    setRemaining(initialRemaining);
    if (!hasLoadedStats) setStatsRaw(defaultStats);
    setMilestoneModal(false);
    setMilestoneIdx(null);
    setMilestonesShown(MILESTONES.map(() => false));
    setEndModal(false);
    setConfirmEnd(false);
    setAppState(AppState.currentState);
    setAlertModal({ show: false, type: null });
    bgStart.current = null;
    timer.current = null;
    ended.current = false;
    startTimestamp.current = initialStartTimestamp;
    lastActiveTimestamp.current = Date.now();
    totalForegroundTime.current = 0;
    startTimer();
    setTimeout(() => setIsLoading(false), 300);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [sessionKey, initialRemaining, initialStartTimestamp, hasLoadedStats, startTimer]);

  // Đọc LAST_ACTIVE_TIME chỉ khi đã có sessionId
  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const lastActiveStr = await AsyncStorage.getItem("LAST_ACTIVE_TIME");
      if (lastActiveStr) {
        const lastActive = Number(lastActiveStr);
        const now = Date.now();
        if (now - lastActive > 0 && now - lastActive < 1000 * 60 * 60 * 24) {
          const bgTime = Math.floor((now - lastActive) / 1000);
          if (bgTime > 0) {
            setStats((s) => ({
              ...s,
              totalBackgroundTime: s.totalBackgroundTime + bgTime,
              backgroundExitCount: s.backgroundExitCount + 1,
              violationCount: s.violationCount + (bgTime > 60 ? 1 : 0),
              backgroundLogs: [
                ...s.backgroundLogs,
                { time: new Date().toLocaleTimeString(), duration: bgTime },
              ],
            }));
            const penaltyMinutes = Math.floor(bgTime / 60);
            if (penaltyMinutes > 0) {
              const penaltyParams = { sessionId, duration: penaltyMinutes };
              console.log('Calling applyPenalty after app relaunch with:', penaltyParams);
              applyPenalty(penaltyParams)
                .then(res => {
                  console.log('applyPenalty response (relaunch):', res);
                })
                .catch((err) => { console.log('applyPenalty error (relaunch):', err); });
            }
            // Hiển thị modal nếu rời app quá 1 phút
            if (bgTime > 60) {
              setPenaltyModal({ show: true, duration: bgTime });
            }
          }
          justRestoredFromKill.current = true;
        }
        await AsyncStorage.removeItem("LAST_ACTIVE_TIME");
      }
    })();
  }, [sessionId, sessionKey, applyPenalty]);

  // Mỗi 1 giây, lưu lastActiveTime nếu app ở foreground và chưa kết thúc
  useEffect(() => {
    if (ended.current) return;
    if (appState !== 'active') return;
    const interval = setInterval(() => {
      AsyncStorage.setItem('LAST_ACTIVE_TIME', Date.now().toString());
    }, 1000);
    return () => clearInterval(interval);
  }, [appState, ended.current, sessionKey]);

  // Chặn back
  useEffect(() => {
    const onBack = () => true;
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, []);

  // Milestone modal + alert modal
  useEffect(() => {
    if (ended.current) return;
    MILESTONES.forEach((m, i) => {
      if (!milestonesShown[i] && remaining <= totalStudyTime * (1 - m)) {
        setMilestoneIdx(i);
        setMilestoneModal(true);
        setMilestonesShown((arr) => arr.map((v, idx) => (idx === i ? true : v)));
      }
    });
    if (remaining === 180) setAlertModal({ show: true, type: '3m' });
    if (remaining === 60) setAlertModal({ show: true, type: '1m' });
  }, [remaining]);

  // Tự động tắt modal milestone và alert sau 3s nếu không ai bấm
  useEffect(() => {
    let timer: any;
    if (milestoneModal) {
      timer = setTimeout(() => setMilestoneModal(false), 3000);
    }
    return () => timer && clearTimeout(timer);
  }, [milestoneModal]);

  useEffect(() => {
    let timer: any;
    if (alertModal.show) {
      timer = setTimeout(() => setAlertModal({ show: false, type: null }), 3000);
    }
    return () => timer && clearTimeout(timer);
  }, [alertModal.show]);

  // Tự động tắt penaltyModal sau 3s
  useEffect(() => {
    if (penaltyModal && penaltyModal.show) {
      const timer = setTimeout(() => setPenaltyModal(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [penaltyModal]);

  // AppState: thống kê thời gian rời app, foreground, gửi notification khi rời app
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (ended.current) return;
      const now = Date.now();
      
      if (appState === "active" && next.match(/inactive|background/)) {
        // Lưu thời điểm rời app
        bgStart.current = now;
        // Cộng dồn thời gian foreground
        totalForegroundTime.current += Math.floor((now - lastActiveTimestamp.current) / 1000);
        
        if (hasNotifPermission) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "You are studying!",
              body: "Tap to resume and avoid penalties!",
              ...(Platform.OS === 'android' ? { channelId: 'study-session' } : {}),
            },
            trigger: null,
          }).catch((e) => {
            console.log('Notification error:', e);
          });
        }
      }
      
      if (appState.match(/inactive|background/) && next === "active") {
        if (justRestoredFromKill.current) {
          justRestoredFromKill.current = false; // Bỏ qua lần đầu sau khi kill app
          setAppState(next);
          return;
        }
        // Khởi động lại timer nếu app được khôi phục
        if (timer.current === null && !ended.current) {
          startTimer();
        }
        
        if (bgStart.current) {
          const bgTime = Math.floor((now - bgStart.current) / 1000);
          if (bgTime > 0) {
            setStats((s) => ({
              ...s,
              totalBackgroundTime: s.totalBackgroundTime + bgTime,
              backgroundExitCount: s.backgroundExitCount + 1,
              violationCount: s.violationCount + (bgTime > 60 ? 1 : 0),
              backgroundLogs: [
                ...s.backgroundLogs,
                { time: new Date().toLocaleTimeString(), duration: bgTime },
              ],
            }));
            // Gọi applyPenalty nếu có sessionId và bgTime > 1 phút
            const penaltyMinutes = Math.floor(bgTime / 60);
            if (sessionId && penaltyMinutes > 0) {
              const penaltyParams = { sessionId, duration: penaltyMinutes };
              console.log('Calling applyPenalty with:', penaltyParams);
              applyPenalty(penaltyParams)
                .then(res => {
                  console.log('applyPenalty response:', res);
                  handleApiResponseLog(res, 'ApplyPenalty');
                })
                .catch((err) => { console.log('applyPenalty error:', err); });
            }
            // Hiển thị modal nếu rời app quá 1 phút (cả khi chỉ background/foreground) - thêm delay để đảm bảo modal luôn hiển thị
            if (bgTime > 60) {
              setTimeout(() => {
                setPenaltyModal({ show: true, duration: bgTime });
              }, 100);
            }
          }
          
          // Nếu hết giờ khi ở nền, show modal khi quay lại
          const elapsed = Math.floor((now - startTimestamp.current) / 1000);
          const newRemaining = Math.max(totalStudyTime - elapsed, 0);
          setRemaining(newRemaining);
          if (newRemaining <= 0 && !endModal) setEndModal(true);
        }
        
        // Đánh dấu lại thời điểm vào foreground
        lastActiveTimestamp.current = now;
        bgStart.current = null;
      }
      
      setAppState(next);
    });
    
    return () => sub.remove();
  }, [appState, remaining, endModal, totalStudyTime, hasNotifPermission, sessionKey, startTimer, sessionId, applyPenalty]);

  // Xin quyền camera khi vào màn hình
  useEffect(() => {
    if (!hasAIEnabled) return;
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, [hasAIEnabled, permission, requestPermission]);

  // Theo dõi trạng thái app để cập nhật appState
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
      if (nextAppState.match(/inactive|background/)) {
        // App vào background, đóng socket AI nếu còn mở
        if (aiSocket) {
          aiSocket.close();
          setAiSocket(null);
          console.log('[AI SOCKET] Closed due to background');
        }
      } else if (nextAppState === 'active') {
        console.log('[AI SOCKET] App returned to foreground, will reconnect if needed');
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [aiSocket]);

  // Reset state AI camera khi sessionKey thay đổi
  useEffect(() => {
    setAiSocket(null);
    setAiAbsentStart(null);
    setAiAbsentTime(0);
    setAiPresenceWarningModal(false);
    setAiWarningModal(null);
    // Có thể reset thêm các state khác nếu cần
  }, [sessionKey]);

  // useEffect kết nối socket AI, thêm sessionKey vào dependency và log
  useEffect(() => {
    console.log('[AI SOCKET] useEffect connect socket, appState:', appState);
    if (!hasAIEnabled || !permission || !permission.granted || appState !== 'active') return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket('ws://concentrate-cxcthbapc3bdadh3.southeastasia-01.azurewebsites.net/ws/image');
      ws.onopen = () => {
        console.log('[AI SOCKET] Connected');
        setAiSocket(ws);
      };
      ws.onclose = (e) => {
        console.log('[AI SOCKET] Closed', e);
        setAiSocket(null);
      };
      ws.onerror = (err) => {
        console.log('[AI SOCKET] Error', err);
        setAiSocket(null);
      };
      ws.onmessage = (event) => {
        console.log('[AI SOCKET] Message', event.data);
      };
    } catch (err) {
      console.log('[AI SOCKET] Exception', err);
      setAiSocket(null);
    }
    return () => {
      if (ws) {
        console.log('[AI SOCKET] Cleanup: closing');
        ws.close();
      }
    };
  }, [hasAIEnabled, permission, permission?.granted, appState, sessionKey]);

  // Chụp ảnh định kỳ và gửi lên AI server, nhận kết quả, xử lý penalty tối ưu
  useEffect(() => {
    console.log('[AI CAMERA DEBUG] useEffect gửi ảnh chạy:', {
      hasAIEnabled,
      permission,
      permissionGranted: permission?.granted,
      aiSocket,
      cameraRefCurrent: !!cameraRef.current,
      appState,
      sessionKey
    });
    if (!hasAIEnabled || !permission || !permission.granted || !aiSocket || !cameraRef.current || appState !== 'active') {
      console.log('[AI CAMERA DEBUG] Không đủ điều kiện gửi ảnh:', {
        hasAIEnabled,
        permission,
        permissionGranted: permission?.granted,
        aiSocket,
        cameraRefCurrent: !!cameraRef.current,
        appState,
        sessionKey
      });
      return;
    }
    let captureInterval: any = null;
    let lastAbsentStart: number | null = null;
    let lastAbsentTime: number = 0;

    // Hàm gửi penalty khi quay lại hoặc end session
    const sendPenaltyIfNeeded = async () => {
      if (lastAbsentStart && lastAbsentTime >= 60) {
        const penaltyMinutes = Math.floor(lastAbsentTime / 60);
        setAiWarningModal({ show: true, duration: lastAbsentTime });
        if (sessionId) {
          const penaltyParams = { sessionId, duration: penaltyMinutes };
          await applyPenalty(penaltyParams);
        }
      }
    };

    // Nhận kết quả từ AI server
    aiSocket.onmessage = (event: any) => {
      console.log('[AI SOCKET] Response from AI server:', event.data);
      const message = event.data;
      if (message.includes('Có người')) {
        setAiPresenceWarningModal(false);
        if (lastAbsentStart) {
          lastAbsentTime = Math.floor((Date.now() - lastAbsentStart) / 1000);
          sendPenaltyIfNeeded();
          lastAbsentStart = null;
          lastAbsentTime = 0;
        }
        setAiAbsentStart(null);
        setAiAbsentTime(0);
      } else if (message.includes('Không có người')) {
        setAiPresenceWarningModal(true);
        if (!lastAbsentStart) {
          lastAbsentStart = Date.now();
        }
        setAiAbsentStart(lastAbsentStart);
        setAiAbsentTime(Math.floor((Date.now() - lastAbsentStart) / 1000));
      }
    };

    // Chụp ảnh định kỳ
    captureInterval = setInterval(async () => {
      if (cameraRef.current && aiSocket && aiSocket.readyState === WebSocket.OPEN) {
        try {
          const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5, skipProcessing: true });
          if (photo.base64) {
            console.log('[AI SOCKET] Sending image to AI server (base64 length):', photo.base64.length);
            console.log('[AI SOCKET] Base64 full:', photo.base64);
            aiSocket.send(photo.base64);
          }
        } catch (err) {
          console.log('[AI SOCKET] Error taking photo:', err);
        }
      }
      // Nếu đang vắng mặt, cập nhật thời gian vắng mặt
      if (lastAbsentStart) {
        lastAbsentTime = Math.floor((Date.now() - lastAbsentStart) / 1000);
        setAiAbsentTime(lastAbsentTime);
      }
    }, 1000);

    return () => {
      if (captureInterval) clearInterval(captureInterval);
      // Khi unmount hoặc end session, nếu đang vắng mặt thì gửi penalty
      sendPenaltyIfNeeded();
    };
  }, [hasAIEnabled, permission, aiSocket, cameraRef, sessionId, applyPenalty, appState, sessionKey]);

  // Tự động tắt penaltyModal sau 3s
  useEffect(() => {
    if (penaltyModal && penaltyModal.show) {
      const timer = setTimeout(() => setPenaltyModal(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [penaltyModal]);

  function formatMinSec(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} min ${s} sec`;
  }

  // Thêm hàm formatShortMinSec
  function formatShortMinSec(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  // Kết thúc phiên học
  const handleEndSession = useCallback(async () => {
    ended.current = true;
    setStats((s) => {
      const now = Date.now();
      let fgTime = totalForegroundTime.current;
      if (appState === "active") {
        fgTime += Math.floor((now - lastActiveTimestamp.current) / 1000);
      }
      const elapsed = Math.min(totalStudyTime, Math.floor((now - startTimestamp.current) / 1000));
      return {
        ...s,
        completedPercent: Math.min(100, Math.round((elapsed / totalStudyTime) * 100)),
        totalBackgroundTime: s.totalBackgroundTime,
        totalStudyTime,
      };
    });
    
    setEndModal(true);
    
    // Clear timer
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    
    bgStart.current = null;
    ended.current = true;

    // Đóng socket AI nếu còn mở
    if (aiSocket) {
      aiSocket.close();
      setAiSocket(null);
    }

    // Xóa session khỏi AsyncStorage
    await AsyncStorage.removeItem('CURRENT_STUDY_SESSION');
    await AsyncStorage.removeItem('LAST_ACTIVE_TIME');
    await AsyncStorage.removeItem('CURRENT_STUDY_SESSION_STATS_' + sessionKey);
  }, [totalStudyTime, appState, sessionKey, aiSocket]);

  // Kết thúc sớm
  function handleEndEarly() {
    setConfirmEnd(true);
  }

  // Helper: log and alert for API errors
  function handleApiResponseLog(res: any, action: string) {
    console.log(`${action} response:`, res);
    if (!res?.isSuccess) {
      alert(res?.message?.messageDetail || `${action} failed`);
    }
  }

  // Gọi endEarlySession khi xác nhận kết thúc sớm
  const confirmEndSession = useCallback(async () => {
    setConfirmEnd(false);
    setIsEnding(true);
    if (sessionId) {
      console.log('Calling endEarlySession');
      try {
        const res = await endEarlySession();
        console.log('endEarlySession response:', res);
        handleApiResponseLog(res, 'EndEarlySession');
      } catch {}
    }
    await handleEndSession();
    setIsEnding(false);
  }, [handleEndSession, endEarlySession, sessionId]);

  // Calculate progress
  const progressPercent = Math.max(0, Math.min(100, ((totalStudyTime - remaining) / totalStudyTime) * 100));

  // Tính màu cho timer theo thời gian còn lại
  let timerColor = theme.colors.primary;
  if (remaining <= 60) timerColor = theme.colors.error;
  else if (remaining <= 180) timerColor = theme.colors.warning;

  // Render
  // Tính lại thống kê thời gian foreground/background
  const now = Date.now();
  const totalElapsed = Math.min(totalStudyTime, Math.floor((now - startTimestamp.current) / 1000));
  const totalLearned = totalElapsed;
  const fgTime = Math.max(0, totalLearned - stats.totalBackgroundTime);

  // Render loading nếu đang loading hoặc đang end early
  if (isLoading || isEnding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.primary, fontWeight: 'bold' }}>{isEnding ? 'Ending session...' : 'Loading session...'}</Text>
      </View>
    );
  }

  // Đảm bảo sessionKey là string duy nhất cho key
  const sessionKeyString = Array.isArray(sessionKey) ? sessionKey[0] : String(sessionKey);

  return (
    <View style={styles.container}>
      {/* Camera Preview */}
      {hasAIEnabled && permission && permission.granted && (
        <View style={{ position: 'absolute', top: 80, right: 20, zIndex: 1000 }}>
          <TouchableOpacity
            style={{ backgroundColor: theme.colors.primary, borderRadius: 20, padding: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}
            onPress={() => setShowCameraPreview?.((v: boolean) => !v)}
          >
            <MaterialIcons name={showCameraPreview ? 'visibility-off' : 'visibility'} size={20} color={theme.colors.onPrimary} />
          </TouchableOpacity>
          {showCameraPreview && (
            <CameraView
              key={sessionKeyString}
              style={{ width: 120, height: 90, borderRadius: 12, overflow: 'hidden', backgroundColor: theme.colors.card, borderWidth: 2, borderColor: theme.colors.primary }}
              facing="front"
              ref={cameraRef}
            />
          )}
          {!showCameraPreview && (
            <CameraView
              key={sessionKeyString}
              style={{ opacity: 0, width: 1, height: 1, position: 'absolute', zIndex: -1 }}
              facing="front"
              ref={cameraRef}
            />
          )}
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
      <Text style={styles.title}>{subject}</Text>
          <Text style={styles.subtitle}>Study Session</Text>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, { borderColor: timerColor, shadowColor: timerColor, backgroundColor: theme.colors.card }]}> 
            <View style={[styles.timerInnerCircle, { borderColor: timerColor, backgroundColor: theme.colors.background }]}> 
              <Text style={[styles.timerText, { color: timerColor }]}> 
        {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
      </Text>
              <Text style={[styles.timerLabel, { color: timerColor }]}>{'remaining'}</Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: timerColor }]} />
            </View>
            <Text style={[styles.progressText, { color: timerColor }]}>{Math.round(progressPercent)}% completed</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.backgroundExitCount}</Text>
              <Text style={styles.statLabel}>App exits</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: stats.violationCount > 0 ? theme.colors.error : theme.colors.primary }]}>
                {stats.violationCount}
              </Text>
              <Text style={styles.statLabel}>Violations</Text>
            </View>
          </View>

          {/* Lịch sử rời app - luôn hiển thị */}
          <View style={styles.logsCard}>
            <View style={styles.logsHeader}>
              <MaterialIcons name="history" size={20} color={theme.colors.primary} />
              <Text style={styles.logsTitle}>App Exit History</Text>
            </View>
            
            {stats.backgroundLogs.length > 0 ? (
              <ScrollView style={styles.logsScroll} showsVerticalScrollIndicator={false}>
                {stats.backgroundLogs.map((log, idx) => (
                  <View key={idx} style={styles.logItem}>
                    <View style={styles.logIndex}>
                      <Text style={styles.logIndexText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.logContent}>
                      <Text style={styles.logTime}>{log.time}</Text>
                      <Text style={styles.logDuration}>{formatShortMinSec(log.duration)}</Text>
                    </View>
                    <MaterialIcons 
                      name={log.duration > 60 ? "warning" : "info"} 
                      size={16} 
                      color={log.duration > 60 ? theme.colors.error : theme.colors.primary} 
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyLogs}>
                <MaterialIcons name="access-time" size={40} color={theme.colors.success} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyLogsText, { fontSize: 18 } ]}>No app exits yet</Text>
                <Text style={[styles.emptyLogsSubtext, { color: theme.colors.success, fontSize: 15 }]}>You are super focused! Keep it up!</Text>
              </View>
            )}
          </View>
        </View>

        {/* End Button */}
        <View style={styles.endButtonContainer}>
          <TouchableOpacity style={styles.endButton} onPress={handleEndEarly}>
            <LinearGradient
              colors={[theme.colors.error, theme.colors.error]}
              style={styles.endButtonGradient}
            >
              <MaterialIcons name="stop" size={20} color={theme.colors.onPrimary} />
              <Text style={styles.endButtonText}>End Early</Text>
            </LinearGradient>
      </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Modals */}
      <Modal visible={milestoneModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.celebrationIcon}>
              {milestoneIdx === 0 && <FontAwesome5 name="rocket" size={32} color={theme.colors.primary} />}
              {milestoneIdx === 1 && <MaterialIcons name="trending-up" size={32} color={theme.colors.primary} />}
              {milestoneIdx === 2 && <MaterialIcons name="flag" size={32} color={theme.colors.primary} />}
              {milestoneIdx === 3 && <MaterialIcons name="emoji-events" size={32} color={theme.colors.primary} />}
            </View>
            <Text style={styles.modalTitle}>
              {milestoneIdx === 0 && 'Great start!'}
              {milestoneIdx === 1 && 'Keep going!'}
              {milestoneIdx === 2 && 'Almost there!'}
              {milestoneIdx === 3 && 'Just a little more!'}
            </Text>
            <Text style={styles.modalText}>
              {milestoneIdx === 0 && 'You have completed 20% of your study time. Keep it up!'}
              {milestoneIdx === 1 && '40% done. Don\'t give up!'}
              {milestoneIdx === 2 && '60% done, you are very persistent!'}
              {milestoneIdx === 3 && '80% done, keep pushing!'}
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setMilestoneModal(false)}>
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal visible={alertModal.show} transparent animationType="fade">
        <View style={styles.modalOverlay}>
         <View style={[styles.modalContainer, styles.alertModal, {
           borderColor: alertModal.type === '3m' ? theme.colors.warning : theme.colors.error,
           borderWidth: 2
         }]}> 
           <View style={[styles.alertIcon, {
             backgroundColor: alertModal.type === '3m' ? theme.colors.warning + '10' : theme.colors.error + '10'
           }]}> 
             <MaterialIcons name="access-time" size={32} color={alertModal.type === '3m' ? theme.colors.warning : theme.colors.error} />
           </View>
           <Text style={[styles.alertTitle, { color: alertModal.type === '3m' ? theme.colors.warning : theme.colors.error }]}> 
             {alertModal.type === '3m' ? '3 minutes left!' : '1 minute left!'}
           </Text>
           <Text style={styles.alertText}>
             {alertModal.type === '3m' 
               ? 'Only 3 minutes left in this study session!'
               : 'Only 1 minute left in this study session!'
             }
           </Text>
           <TouchableOpacity 
             style={[styles.modalButton, {
               backgroundColor: alertModal.type === '3m' ? theme.colors.warning : theme.colors.error,
               minWidth: 100
             }]} 
             onPress={() => setAlertModal({ show: false, type: null })}
           >
             <Text style={[styles.modalButtonText, { color: theme.colors.onPrimary }]}>Got it</Text>
           </TouchableOpacity>
         </View>
        </View>
      </Modal>
      
      <Modal visible={confirmEnd} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.warningIcon, { borderWidth: 2, borderColor: theme.colors.error, backgroundColor: theme.colors.error + '10' }]}> 
              <MaterialIcons name="warning" size={40} color={theme.colors.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.colors.error, fontWeight: 'bold' }]}>Early End Warning</Text>
            <Text style={[styles.modalText, { color: theme.colors.error, fontWeight: '600', textAlign: 'center', marginBottom: 8 }]}>Ending early will deduct 50% of your session points and add penalty points for each violation.</Text>
            <Text style={[styles.modalText, { color: theme.colors.text, textAlign: 'center', marginBottom: 16 }]}>Are you sure you want to end the session?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.colors.surfaceVariant, flex: 1, marginRight: 8 }]} onPress={() => setConfirmEnd(false)}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.colors.error, flex: 1, marginLeft: 8 }]} onPress={confirmEndSession}>
                <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontWeight: '600', textAlign: 'center' }}>End</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal visible={endModal} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.endModalContainer, { alignItems: 'center', paddingHorizontal: 16, backgroundColor: theme.colors.card }]}> 
            <View style={{ alignItems: 'center', width: '100%' }}>
              {/* Icon và tiêu đề */}
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <MaterialIcons name="check-circle" size={36} color={theme.colors.primary} />
              </View>
              <Text style={{ color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginBottom: 2, textAlign: 'center' }}>Session Completed!</Text>
              <Text style={{ color: theme.colors.text, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>Your results</Text>

              {/* Stats 2 hàng */}
              <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                <View style={{ width: '50%', padding: 6 }}>
                  <View style={{ backgroundColor: theme.colors.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.outline }}>
                    <MaterialIcons name="percent" size={18} color={theme.colors.primary} style={{ marginBottom: 2 }} />
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.primary }}>{Math.min(100, Math.round((totalElapsed / totalStudyTime) * 100))}%</Text>
                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 }}>Completed</Text>
                  </View>
                </View>
                <View style={{ width: '50%', padding: 6 }}>
                  <View style={{ backgroundColor: theme.colors.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.outline }}>
                    <MaterialIcons name="timer" size={18} color={theme.colors.primary} style={{ marginBottom: 2 }} />
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.primary }}>{formatShortMinSec(totalLearned)}</Text>
                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 }}>Studied</Text>
                  </View>
                </View>
                <View style={{ width: '50%', padding: 6 }}>
                  <View style={{ backgroundColor: theme.colors.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.outline }}>
                    <MaterialIcons name="phone-android" size={18} color={theme.colors.primary} style={{ marginBottom: 2 }} />
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.primary }}>{formatShortMinSec(fgTime)}</Text>
                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 }}>In app</Text>
                  </View>
                </View>
                <View style={{ width: '50%', padding: 6 }}>
                  <View style={{ backgroundColor: theme.colors.background, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.outline }}>
                    <MaterialIcons name="exit-to-app" size={18} color={theme.colors.primary} style={{ marginBottom: 2 }} />
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: theme.colors.primary }}>{formatShortMinSec(stats.totalBackgroundTime)}</Text>
                    <Text style={{ fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 }}>Out of app</Text>
                  </View>
                </View>
              </View>

              {/* Vi phạm & số lần thoát app */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary + '10', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8 }}>
                  <MaterialIcons name="history" size={15} color={theme.colors.primary} style={{ marginRight: 2 }} />
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 12 }}>{stats.backgroundExitCount}</Text>
                  <Text style={{ color: theme.colors.primary, fontSize: 11, marginLeft: 2 }}>app exits</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.error + '10', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <MaterialIcons name="error-outline" size={15} color={theme.colors.error} style={{ marginRight: 2 }} />
                  <Text style={{ color: theme.colors.error, fontWeight: 'bold', fontSize: 12 }}>{stats.violationCount}</Text>
                  <Text style={{ color: theme.colors.error, fontSize: 11, marginLeft: 2 }}>violations</Text>
                </View>
              </View>

              {/* Lịch sử thoát app */}
              {/* App exit details - REMOVE THIS SECTION */}

              {/* Nút về trang chủ */}
              <TouchableOpacity style={[styles.homeButton, { marginTop: 6, width: '90%' }]} onPress={async () => {
                setEndModal(false);
                router.replace("/(user)/home");
              }}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primary]}
                  style={[styles.homeButtonGradient, { borderRadius: 20, justifyContent: 'center' }]}
                >
                  <MaterialIcons name="home" size={18} color={theme.colors.onPrimary} />
                  <Text style={styles.homeButtonText}>{'Go to Home'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {penaltyModal && penaltyModal.show && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { alignItems: 'center', backgroundColor: theme.colors.card }]}> 
              <View style={[styles.warningIcon, { borderWidth: 2, borderColor: theme.colors.warning, backgroundColor: theme.colors.warning + '10' }]}> 
                <MaterialIcons name="access-time" size={40} color={theme.colors.warning} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.warning, fontWeight: 'bold' }]}>Rời app quá lâu</Text>
              <Text style={[styles.modalText, { color: theme.colors.text, textAlign: 'center', marginBottom: 8 }]}>Bạn đã rời app quá lâu: {Math.floor(penaltyModal.duration / 60)} phút {penaltyModal.duration % 60} giây</Text>
            </View>
          </View>
        </Modal>
      )}
      {/* Modal cảnh báo luôn hiển thị khi không có người trước camera */}
      {aiPresenceWarningModal && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { alignItems: 'center', backgroundColor: theme.colors.card }]}> 
              <View style={[styles.warningIcon, { borderWidth: 2, borderColor: theme.colors.warning, backgroundColor: theme.colors.warning + '10' }]}> 
                <MaterialIcons name="visibility-off" size={40} color={theme.colors.warning} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.warning, fontWeight: 'bold' }]}>Không phát hiện bạn trước camera</Text>
              <Text style={[styles.modalText, { color: theme.colors.text, textAlign: 'center', marginBottom: 16 }]}>Vui lòng quay lại trước camera để tiếp tục học tập và tránh bị phạt.</Text>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.warning }]}
                onPress={() => setAiPresenceWarningModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.onPrimary }]}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {/* Modal penalty AI */}
      {aiWarningModal && aiWarningModal.show && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { alignItems: 'center', backgroundColor: theme.colors.card }]}> 
              <View style={[styles.warningIcon, { borderWidth: 2, borderColor: theme.colors.error, backgroundColor: theme.colors.error + '10' }]}> 
                <MaterialIcons name="visibility-off" size={40} color={theme.colors.error} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.colors.error, fontWeight: 'bold' }]}>AI Detection Warning</Text>
              <Text style={[styles.modalText, { color: theme.colors.text, textAlign: 'center', marginBottom: 8 }]}>Bạn đã vắng mặt trước camera: {Math.floor(aiWarningModal.duration / 60)} phút {aiWarningModal.duration % 60} giây</Text>
              <Text style={[styles.modalText, { color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 16 }]}>Vui lòng quay lại vị trí học để tránh bị phạt thêm.</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  timerInnerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  timerLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: width - 80,
    height: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    color: theme.colors.primary,
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.outline,
  },
  logsCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    minHeight: 180,
    position: 'relative',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  logsScroll: {
    flexGrow: 1,
    maxHeight: '100%',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  logIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logIndexText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  logContent: {
    flex: 1,
  },
  logTime: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  logDuration: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  emptyLogs: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 12,
    marginBottom: 12,
  },
  emptyLogsText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 12,
  },
  emptyLogsSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  endButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  endButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  endButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  endButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 340,
    width: '100%',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  celebrationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.success + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
  },
  modalButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Alert modal styles
  alertModal: {
    borderColor: theme.colors.warning,
    borderWidth: 2,
  },
  alertIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.warning + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.warning,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  
  // Confirmation modal styles
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: theme.colors.surfaceVariant,
    flex: 1,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: theme.colors.error,
    flex: 1,
  },
  
  // End modal styles
  endModalContainer: {
    maxHeight: height * 0.6,
    paddingVertical: 16,
  },
  completedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.success + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  statBoxNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statBoxLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  summaryStats: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: 4,
  },
  finalLogsContainer: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    maxHeight: 80,
  },
  finalLogsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  finalLogsScroll: {
    maxHeight: 60,
  },
  finalLogItem: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  homeButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  homeButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});