import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { useAuthStore } from "../store/authStore";

export default function UserHome() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      {/* Avatar + Title */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.title}>Study-Agent</Text>
      </View>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={28}
            color="#4A90E2"
            style={[styles.statIconBase, { backgroundColor: "#DDE6F0" }]}
          />
          <Text style={styles.statValue}>24.5</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={28}
            color="#FF6384"
            style={[styles.statIconBase, { backgroundColor: "#FADDE0" }]}
          />
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>Violations</Text>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons
            name="wallet-outline"
            size={28}
            color="#32CD32"
            style={[styles.statIconBase, { backgroundColor: "#E0F0E0" }]}
          />
          <Text style={styles.statValue}>50K</Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
      </View>
      
      {/* Start Button */}
      <TouchableOpacity
        style={styles.startButtons}
      >
        <Svg width="40" height="40" viewBox="0 0 100 100">
          <Polygon
            points="30,20 80,50 30,80"
            fill="none"
            stroke="white"
            strokeWidth="8"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.startButtonLabel}>Start Learning</Text>
      
      {/* Weekly Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Statistics</Text>

        <View style={styles.chartPlaceholder}>
          <View style={styles.chartWrapper}>
            {/* Y-Axis */}
            <View style={styles.yAxis}>
              <Text style={styles.yAxisLabel}>8</Text>
              <Text style={styles.yAxisLabel}>6</Text>
              <Text style={styles.yAxisLabel}>4</Text>
              <Text style={styles.yAxisLabel}>2</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>

            {/* Chart Area */}
            <View style={styles.chartArea}>
              {/* Grid Lines */}
              <View style={styles.gridContainer}>
                {/* Horizontal Grid Lines */}
                <View style={[styles.gridLineHorizontal, { bottom: "0%" }]} />
                <View style={[styles.gridLineHorizontal, { bottom: "25%" }]} />
                <View style={[styles.gridLineHorizontal, { bottom: "50%" }]} />
                <View style={[styles.gridLineHorizontal, { bottom: "75%" }]} />
                <View style={[styles.gridLineHorizontal, { bottom: "100%" }]} />

                {/* Vertical Grid Lines */}
                <View style={[styles.gridLineVertical, { left: "7.14%" }]} />
                <View style={[styles.gridLineVertical, { left: "21.43%" }]} />
                <View style={[styles.gridLineVertical, { left: "35.71%" }]} />
                <View style={[styles.gridLineVertical, { left: "50%" }]} />
                <View style={[styles.gridLineVertical, { left: "64.29%" }]} />
                <View style={[styles.gridLineVertical, { left: "78.57%" }]} />
                <View style={[styles.gridLineVertical, { left: "92.86%" }]} />
              </View>

              <View style={styles.barChart}>
                {[
                  [40, 35],
                  [60, 45],
                  [80, 70],
                  [60, 55],
                  [40, 35],
                  [30, 25],
                  [10, 5],
                ].map(([red, blue], idx) => (
                  <View key={idx} style={styles.barGroup}>
                    <View
                      style={[
                        styles.bar,
                        { height: red, backgroundColor: "#FF6384" },
                      ]}
                    />
                    <View
                      style={[
                        styles.bar,
                        { height: blue, backgroundColor: "#36A2EB" },
                      ]}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.xAxis}>
                <Text style={styles.xAxisLabel}>T2</Text>
                <Text style={styles.xAxisLabel}>T3</Text>
                <Text style={styles.xAxisLabel}>T4</Text>
                <Text style={styles.xAxisLabel}>T5</Text>
                <Text style={styles.xAxisLabel}>T6</Text>
                <Text style={styles.xAxisLabel}>T7</Text>
                <Text style={styles.xAxisLabel}>CN</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: "#E6F0FA",
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFD1DC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "#FFF",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statIconBase: {
    borderRadius: 25,
    padding: 10,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
  },
  startButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  startButtonLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  chartPlaceholder: {
    width: "100%",
    alignItems: "center",
  },
  chartWrapper: {
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-end",
  },
  yAxis: {
    justifyContent: "space-between",
    height: 120,
    marginRight: 15,
    paddingBottom: 20,
  },
  yAxisLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    minWidth: 15,
  },
  chartArea: {
    flex: 1,
    position: "relative",
  },
  gridContainer: {
    position: "absolute",
    width: "100%",
    height: 120,
    top: 0,
  },
  gridLineHorizontal: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "#C0C0C0",
    opacity: 0.8,
  },
  gridLineVertical: {
    position: "absolute",
    height: "100%",
    width: 1,
    backgroundColor: "#C0C0C0",
    opacity: 0.8,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "flex-end",
    height: 120,
    marginBottom: 5,
  },
  bar: {
    width: 14,
    borderRadius: 4,
  },
  xAxis: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  xAxisLabel: {
    fontSize: 12,
    color: "#666",
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    position: "absolute",
    bottom: 0,
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },

  barGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 2,
  },

  startButtons: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
    elevation: 20,
    zIndex: 10,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
});
