import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Polygon, Defs, LinearGradient, Stop } from "react-native-svg";
import { navigate } from '../../utils/navigation';
import { useSessionStore } from "../../store/sessionStore";
import { usePaymentStore } from "../../store/paymentStore";
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';

export default function UserHome() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  
  const { stasiscHoursRule, getStasiscHoursRule, weeklySession, getWeeklySession } = useSessionStore();
  const { point, getPoint } = usePaymentStore();
  
  const styles = createStyles(theme);

  useFocusEffect(
    React.useCallback(() => {
      getStasiscHoursRule();
      getPoint();
      getWeeklySession();
    }, [])
  );

  const totalHours = stasiscHoursRule?.totalHours || 0;
  const totalRules = stasiscHoursRule?.totalRules || 0;
  const studyPoint = point || 0;

  // Format totalHours thành 'Xh Yp'
  const totalHoursStr = totalHours > 0 ? `${Math.floor(totalHours/60)}h ${totalHours%60}m` : '0h 0m';

  // Chart data từ weeklySession
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
  const chartData = (weeklySession && weeklySession.length === 7)
    ? weeklySession.map(item => Number((item.totalDuration/60).toFixed(1)))
    : [0,0,0,0,0,0,0];

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
                    data: chartData.length > 0 ? chartData : [0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              }}
              width={Dimensions.get("window").width - 64}
              height={200}
              yAxisLabel=""
              yAxisSuffix="h"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 1,
                barPercentage: 0.6,
                color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 118, 136, ${opacity})`,
                style: {
                  borderRadius: 12,
                },
                propsForBackgroundLines: {
                  stroke: "#F0F2F5",
                  strokeDasharray: "3,3",
                  strokeWidth: 1,
                },
                propsForLabels: {
                  fontSize: 12,
                  fontWeight: "500",
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 12,
                paddingRight: 0,
              }}
              showValuesOnTopOfBars={true}
              fromZero={true}
              withHorizontalLabels={true}
              withVerticalLabels={true}
            />
          </View>
        </View>
      </ScrollView>
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
});
