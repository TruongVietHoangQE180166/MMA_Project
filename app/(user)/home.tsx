import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  ActivityIndicator,
  AppState,
} from "react-native";
// Fix: Use react-native-chart-kit instead of victory
import { BarChart } from "react-native-chart-kit";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Polygon } from "react-native-svg";
import { navigate } from '../../utils/navigation';
import { useSessionStore } from "../../store/sessionStore";
import { usePaymentStore } from "../../store/paymentStore";
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { checkInUtils, CheckInData } from '../../utils/checkIn';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add type definitions
interface ChartDataPoint {
  x: string;
  y: number;
}

export default function UserHome() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  
  const { stasiscHoursRule, getStasiscHoursRule, weeklySession, getWeeklySession } = useSessionStore();
  const { point, getPoint } = usePaymentStore();
  
  // Check-in notification state
  const [showCheckInNotification, setShowCheckInNotification] = useState(false);
  const [hasShownNotificationThisSession, setHasShownNotificationThisSession] = useState(false);
  
  const styles = createStyles(theme);

  // Load data mỗi khi focus vào home
  useFocusEffect(
    React.useCallback(() => {
      getStasiscHoursRule();
      getPoint();
      getWeeklySession();
    }, [])
  );

  // Check check-in chỉ khi app mở (component mount)
  useEffect(() => {
    // Chỉ check nếu chưa hiển thị notification trong session này
    if (!hasShownNotificationThisSession) {
      checkDailyCheckIn();
    }
  }, []); // Empty dependency array = chỉ chạy 1 lần khi mount

  // Kiểm tra check-in hàng ngày
  const checkDailyCheckIn = async () => {
    try {
      const hasCheckedIn = await checkInUtils.hasCheckedInToday();
      
      if (!hasCheckedIn && !hasShownNotificationThisSession) {
        setShowCheckInNotification(true);
        setHasShownNotificationThisSession(true);
      }
    } catch (error) {
      console.error('Error checking daily check-in:', error);
    }
  };

  // Reset notification state khi app restart
  useEffect(() => {
    // Reset khi app state thay đổi (app vào background/foreground)
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App trở lại foreground, reset notification state
        setHasShownNotificationThisSession(false);
        // Check lại check-in khi app trở lại foreground (sau khi reset)
        setTimeout(() => {
          checkDailyCheckIn();
        }, 100);
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, []);

  // Animation for play icon scale
  const playScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(playScale, {
          toValue: 1.25,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(playScale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
    return () => playScale.stopAnimation();
  }, [playScale]);

  const totalHours = stasiscHoursRule?.totalHours || 0;
  const totalRules = stasiscHoursRule?.totalRules || 0;
  const studyPoint = point || 0;

  // Format totalHours thành 'Xh Yp'
  const totalHoursStr = totalHours > 0 ? `${Math.floor(totalHours/60)}h ${totalHours%60}m` : '0h 0m';

  // Chart data for react-native-chart-kit
  const chartLabels = (weeklySession && weeklySession.length === 7)
    ? weeklySession.map(item => {
        const d = new Date(item.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      })
    : Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      
  const chartDataValues = (weeklySession && weeklySession.length === 7)
    ? weeklySession.map(item => Number((item.totalDuration/60).toFixed(1)))
    : Array.from({ length: 7 }, () => 0);

  const chartConfig = {
    backgroundGradientFrom: theme.colors.card,
    backgroundGradientTo: theme.colors.card,
    color: (opacity = 1) => `rgba(46, 134, 193, 1)`, // Màu xanh đồng nhất
    fillShadowGradient: "#2E86C1", // Màu xanh đậm cho toàn bộ cột
    fillShadowGradientTo: "#2E86C1", // Màu kết thúc giống màu bắt đầu
    fillShadowGradientOpacity: 1, // Không nhạt
    labelColor: (opacity = 1) => theme.colors.textSecondary,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  };

  const maxValue = Math.max(...chartDataValues, 1);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 48, paddingBottom: 120 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        style={styles.scrollView}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Study-Agent</Text>
            <View style={styles.subtitleContainer}>
              <MaterialCommunityIcons
                name="robot-excited"
                size={16}
                color="#4A90E2"
                style={styles.aiIcon}
              />
              <Text style={styles.subtitle}>Your AI Learning Companion</Text>
            </View>
          </View>
        </View>

        {/* Stats Container */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color="#4A90E2"
              />
            </View>
            <Text style={styles.statValue}>{totalHoursStr}</Text>
            <Text style={styles.statLabel}>Total Hours</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={24}
                color="#FF6B7A"
              />
            </View>
            <Text style={styles.statValue}>{totalRules ?? 0}</Text>
            <Text style={styles.statLabel}>Violations</Text>
          </View>

          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons
                name="star-outline"
                size={24}
                color="#00D4AA"
              />
            </View>
            <Text style={styles.statValue}>{studyPoint?.toLocaleString() ?? 0}</Text>
            <Text style={styles.statLabel}>Study-point</Text>
          </View>
        </View>

        {/* Start Button with Simple Animation */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={() => navigate.toCreateSessionStudy()}
          >
            <Animated.View style={{ transform: [{ scale: playScale }] }}>
              <Svg width="56" height="56" viewBox="0 0 100 100">
                <Polygon
                  points="35,20 80,50 35,80"
                  fill="#FFFFFF"
                  strokeWidth="0"
                />
              </Svg>
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.startButtonLabel}>Start Learning</Text>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <MaterialCommunityIcons
                name="chart-bar"
                size={20}
                color="#4A90E2"
                style={styles.chartIcon}
              />
              <Text style={styles.chartTitle}>Weekly Study Hours</Text>
            </View>
            <Text style={styles.chartSubtitle}>Track your learning progress</Text>
          </View>
          
          <View style={styles.chartWrapper}>
            <BarChart
              data={{
                labels: chartLabels,
                datasets: [
                  {
                    data: chartDataValues,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix="h"
              chartConfig={chartConfig}
              style={{
                marginVertical: 8,
                borderRadius: 12,
              }}
              showValuesOnTopOfBars={true}
              withInnerLines={true}
              fromZero={true}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Check-in Notification */}
      {showCheckInNotification && (
        <View style={styles.checkInNotificationContainer}>
          <View style={styles.checkInNotificationContent}>
            <TouchableOpacity
              style={styles.closeNotificationButton}
              onPress={() => setShowCheckInNotification(false)}
            >
              <MaterialCommunityIcons 
                name="close" 
                size={24} 
                color={theme.colors.textSecondary} 
              />
            </TouchableOpacity>
            <MaterialCommunityIcons
              name="calendar-check"
              size={48}
              color={theme.colors.primary}
            />
            <Text style={styles.checkInNotificationTitle}>Daily Check-in</Text>
            <Text style={styles.checkInNotificationSubtitle}>
              Complete your daily check-in to earn 1 study point!
            </Text>
            <TouchableOpacity
              style={styles.checkInNotificationButton}
              onPress={() => navigate.toWallet()}
            >
              <Text style={styles.checkInNotificationButtonText}>
                Go to Wallet
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 1,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiIcon: {
    marginRight: 6,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    backgroundColor: theme.colors.card,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 40,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "500",
    textAlign: "center",
  },
  startButtonContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  startButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonLabel: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: "100%",
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
  },
  chartTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  chartIcon: {
    marginRight: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  chartSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  chartWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    paddingHorizontal: 8,
  },
  checkInNotificationContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  checkInNotificationContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  closeNotificationButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  checkInNotificationTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 12,
    textAlign: "center",
  },
  checkInNotificationSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  checkInNotificationButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    marginTop: 20,
  },
  checkInNotificationButtonText: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    fontWeight: "600",
  },
});