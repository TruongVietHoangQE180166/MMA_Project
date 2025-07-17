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

const MILESTONES = [0.2, 0.4, 0.6, 0.8];

export default function StudySession() {
  useKeepAwake();
  const router = useRouter();
  // Bỏ lấy sessionId từ params, chỉ lấy sessionKey nếu cần
  const { duration = "60", subject = "", sessionKey = "0", remainingSeconds } = useLocalSearchParams();
  const totalStudyTime = Number(duration) * 60; // giây

  const { initialRemaining, initialStartTimestamp } = useMemo(() => {
    const remaining = remainingSeconds ? Number(remainingSeconds) : totalStudyTime;
    const startTs = remainingSeconds
      ? Date.now() - (totalStudyTime - Number(remainingSeconds)) * 1000
      : Date.now();
    return { initialRemaining: remaining, initialStartTimestamp: startTs };
  }, [duration, remainingSeconds, sessionKey]);

  const defaultStats: StudySessionStats = {
    totalBackgroundTime: 0,
    backgroundExitCount: 0,
    violationCount: 0,
    completedPercent: 0,
    totalStudyTime,
    backgroundLogs: [],
  };
  const [remaining, setRemaining] = useState(initialRemaining);
  const [stats, setStatsRaw] = useState<StudySessionStats>(defaultStats);
  const [hasLoadedStats, setHasLoadedStats] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [milestoneIdx, setMilestoneIdx] = useState<number | null>(null);
  const [milestonesShown, setMilestonesShown] = useState<boolean[]>(MILESTONES.map(() => false));
  const [endModal, setEndModal] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
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

  // Khi mount, luôn lấy sessionId từ AsyncStorage
  useEffect(() => {
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
  }, []);
  
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
    
    // Xóa session khỏi AsyncStorage
    await AsyncStorage.removeItem('CURRENT_STUDY_SESSION');
    await AsyncStorage.removeItem('LAST_ACTIVE_TIME');
    await AsyncStorage.removeItem('CURRENT_STUDY_SESSION_STATS_' + sessionKey);
  }, [totalStudyTime, appState, sessionKey]);

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
  let timerColor = '#4A90E2';
  if (remaining <= 60) timerColor = '#FF6B6B';
  else if (remaining <= 180) timerColor = '#FFB300';

  // Render
  // Tính lại thống kê thời gian foreground/background
  const now = Date.now();
  const totalElapsed = Math.min(totalStudyTime, Math.floor((now - startTimestamp.current) / 1000));
  const totalLearned = totalElapsed;
  const fgTime = Math.max(0, totalLearned - stats.totalBackgroundTime);

  // Render loading nếu đang loading hoặc đang end early
  if (isLoading || isEnding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f7fa' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 16, color: '#4A90E2', fontWeight: 'bold' }}>{isEnding ? 'Ending session...' : 'Loading session...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
      <Text style={styles.title}>{subject}</Text>
          <Text style={styles.subtitle}>Study Session</Text>
        </View>

        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, { borderColor: timerColor, shadowColor: timerColor }]}> 
            <View style={[styles.timerInnerCircle, { borderColor: timerColor }]}> 
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
              <Text style={[styles.statNumber, { color: stats.violationCount > 0 ? '#ff6b6b' : '#4A90E2' }]}>
                {stats.violationCount}
              </Text>
              <Text style={styles.statLabel}>Violations</Text>
            </View>
          </View>

          {/* Lịch sử rời app - luôn hiển thị */}
          <View style={styles.logsCard}>
            <View style={styles.logsHeader}>
              <MaterialIcons name="history" size={20} color="#4A90E2" />
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
                      color={log.duration > 60 ? "#ff6b6b" : "#4A90E2"} 
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyLogs}>
                <MaterialIcons name="check-circle" size={32} color="#4A90E2" />
                <Text style={styles.emptyLogsText}>No app exits yet</Text>
                <Text style={styles.emptyLogsSubtext}>Great! You are staying focused</Text>
          </View>
        )}
      </View>
        </View>

        {/* End Button */}
        <View style={styles.endButtonContainer}>
          <TouchableOpacity style={styles.endButton} onPress={handleEndEarly}>
            <LinearGradient
              colors={['#ff6b6b', '#ee5a52']}
              style={styles.endButtonGradient}
            >
              <MaterialIcons name="stop" size={20} color="#ffffff" />
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
              {milestoneIdx === 0 && <FontAwesome5 name="rocket" size={32} color="#4A90E2" />}
              {milestoneIdx === 1 && <MaterialIcons name="trending-up" size={32} color="#4A90E2" />}
              {milestoneIdx === 2 && <MaterialIcons name="flag" size={32} color="#4A90E2" />}
              {milestoneIdx === 3 && <MaterialIcons name="emoji-events" size={32} color="#4A90E2" />}
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
           borderColor: alertModal.type === '3m' ? '#FFB300' : '#FF6B6B',
           borderWidth: 2
         }]}> 
           <View style={[styles.alertIcon, {
             backgroundColor: alertModal.type === '3m' ? '#FFF8E1' : '#FFEAEA'
           }]}> 
             <MaterialIcons name="access-time" size={32} color={alertModal.type === '3m' ? '#FFB300' : '#FF6B6B'} />
           </View>
           <Text style={[styles.alertTitle, { color: alertModal.type === '3m' ? '#FFB300' : '#FF6B6B' }]}> 
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
               backgroundColor: alertModal.type === '3m' ? '#FFB300' : '#FF6B6B',
               minWidth: 100
             }]} 
             onPress={() => setAlertModal({ show: false, type: null })}
           >
             <Text style={[styles.modalButtonText, { color: '#fff' }]}>Got it</Text>
           </TouchableOpacity>
         </View>
        </View>
      </Modal>
      
      <Modal visible={confirmEnd} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={[styles.warningIcon, { borderWidth: 2, borderColor: '#FF6B6B', backgroundColor: '#FFF0F0' }]}> 
              <MaterialIcons name="warning" size={40} color="#FF6B6B" />
            </View>
            <Text style={[styles.modalTitle, { color: '#FF6B6B', fontWeight: 'bold' }]}>Early End Warning</Text>
            <Text style={[styles.modalText, { color: '#FF6B6B', fontWeight: '600', textAlign: 'center', marginBottom: 8 }]}>Ending early will deduct 50% of your session points and add penalty points for each violation.</Text>
            <Text style={[styles.modalText, { color: '#333', textAlign: 'center', marginBottom: 16 }]}>Are you sure you want to end the session?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#e0e0e0', flex: 1, marginRight: 8 }]} onPress={() => setConfirmEnd(false)}>
                <Text style={{ color: '#666', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF6B6B', flex: 1, marginLeft: 8 }]} onPress={confirmEndSession}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>End</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal visible={endModal} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.endModalContainer, { alignItems: 'center', paddingHorizontal: 0 }]}> 
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E6F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <MaterialIcons name="check-circle" size={56} color="#4A90E2" />
            </View>
            <Text style={[styles.modalTitle, { color: '#4A90E2', fontSize: 22, fontWeight: 'bold', marginBottom: 4 }]}>You have completed the session!</Text>
            <Text style={[styles.modalText, { color: '#333', fontSize: 15, marginBottom: 18 }]}>Here are your results.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '90%', marginBottom: 18 }}>
              <View style={{ width: '48%', backgroundColor: '#F8FAFE', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <MaterialIcons name="percent" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4A90E2' }}>{Math.min(100, Math.round((totalElapsed / totalStudyTime) * 100))}%</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Completed</Text>
              </View>
              <View style={{ width: '48%', backgroundColor: '#F8FAFE', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <MaterialIcons name="timer" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4A90E2' }}>{formatShortMinSec(totalLearned)}</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Studied</Text>
              </View>
              <View style={{ width: '48%', backgroundColor: '#F8FAFE', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <MaterialIcons name="phone-android" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4A90E2' }}>{formatShortMinSec(fgTime)}</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>In app</Text>
              </View>
              <View style={{ width: '48%', backgroundColor: '#F8FAFE', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' }}>
                <MaterialIcons name="exit-to-app" size={24} color="#4A90E2" style={{ marginBottom: 4 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4A90E2' }}>{formatShortMinSec(stats.totalBackgroundTime)}</Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Out of app</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F7FF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, marginRight: 12 }}>
                <MaterialIcons name="history" size={18} color="#4A90E2" style={{ marginRight: 4 }} />
                <Text style={{ color: '#4A90E2', fontWeight: 'bold', fontSize: 15 }}>{stats.backgroundExitCount}</Text>
                <Text style={{ color: '#4A90E2', fontSize: 13, marginLeft: 4 }}>app exits</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0F0', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 }}>
                <MaterialIcons name="error-outline" size={18} color="#FF6B6B" style={{ marginRight: 4 }} />
                <Text style={{ color: '#FF6B6B', fontWeight: 'bold', fontSize: 15 }}>{stats.violationCount}</Text>
                <Text style={{ color: '#FF6B6B', fontSize: 13, marginLeft: 4 }}>violations</Text>
              </View>
            </View>
            {stats.backgroundLogs.length > 0 && (
              <View style={styles.finalLogsContainer}>
                <Text style={styles.finalLogsTitle}>App exit details:</Text>
                <ScrollView style={styles.finalLogsScroll} showsVerticalScrollIndicator={false}>
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
                        color={log.duration > 60 ? "#ff6b6b" : "#4A90E2"} 
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            <TouchableOpacity style={[styles.homeButton, { marginTop: 8, width: '90%' }]} onPress={async () => {
              setEndModal(false);
              router.replace("/(user)/home");
            }}>
              <LinearGradient
                colors={['#4A90E2', '#4A90E2']}
                style={[styles.homeButtonGradient, { borderRadius: 20, justifyContent: 'center' }]}
              >
                <MaterialIcons name="home" size={20} color="#ffffff" />
                <Text style={styles.homeButtonText}>Go to Home</Text>
              </LinearGradient>
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
    backgroundColor: '#f5f7fa',
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
    color: '#4A90E2', // Thay từ '#1e3c72'
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  timerInnerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A90E2', 
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: width - 80,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2', 
    borderRadius: 4,
  },
  progressText: {
    color: '#4A90E2', 
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2', 
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  logsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    height: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginLeft: 8,
  },
  logsScroll: {
    flex: 1,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logIndexText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  logContent: {
    flex: 1,
  },
  logTime: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  logDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyLogs: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyLogsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 12,
  },
  emptyLogsSubtext: {
    fontSize: 14,
    color: '#666',
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
    shadowColor: '#000',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 340,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  celebrationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Alert modal styles
  alertModal: {
    borderColor: '#ff9800',
    borderWidth: 2,
  },
  alertIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  
  // Confirmation modal styles
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff3e0',
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
    backgroundColor: '#e0e0e0',
    flex: 1,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#ff6b6b',
    flex: 1,
  },
  
  // End modal styles
  endModalContainer: {
    maxHeight: height * 0.8,
    paddingVertical: 24,
  },
  completedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statBoxNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryStats: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  finalLogsContainer: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    maxHeight: 120,
  },
  finalLogsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 8,
  },
  finalLogsScroll: {
    maxHeight: 80,
  },
  finalLogItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  homeButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});