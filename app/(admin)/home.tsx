import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  balance: string;
  avatar: string;
}

interface WithdrawRequest {
  id: number;
  name: string;
  date: string;
  amount: string;
  status: "pending" | "approved";
}

interface Stats {
  totalUsers: number;
  revenue: string;
  withdrawRequests: number;
  todaySessions: number;
  userGrowth: number;
  revenueGrowth: number;
  sessionGrowth: number;
}

export default function AdminHome() {
  const { user } = useAuthStore();
  const screenWidth = Dimensions.get("window").width;

  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [stats] = useState<Stats>({
    totalUsers: 2451,
    revenue: "15.2M",
    withdrawRequests: 8,
    todaySessions: 142,
    userGrowth: 12,
    revenueGrowth: 8,
    sessionGrowth: 25,
  });

  const [users] = useState<User[]>([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@gmail.com",
      balance: "120.000đ",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranb@gmail.com",
      balance: "350.000đ",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
  ]);

  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([
    {
      id: 1,
      name: "Lê Văn C",
      date: "23/02/2024",
      amount: "200.000đ",
      status: "pending",
    },
    {
      id: 2,
      name: "Phạm Thị D",
      date: "23/02/2024",
      amount: "500.000đ",
      status: "pending",
    },
  ]);

  const chartData = useMemo(
    () => ({
      userChart: {
        labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
        datasets: [{ data: [400, 300, 500, 350, 600, 800, 700] }],
      },
      revenueChart: {
        labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
        datasets: [{ data: [1100, 850, 1350, 1650, 950, 2000, 1550], 
        }],
      },
    }),
    []
  );

  const handleApprove = useCallback(async (requestId: number) => {
    setLoading(true);
    try {
      // API call here
      setWithdrawRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "approved" } : req
        )
      );
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
          </View>
          <TouchableOpacity style={styles.notificationIcon}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.dark}
            />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons name="people" size={24} color="#2196F3" />
              <Text style={styles.statPercentage}>+{stats.userGrowth}%</Text>
            </View>
            <Text style={styles.statLabel}>Tổng người dùng</Text>
            <Text style={styles.statNumber}>
              {stats.totalUsers.toLocaleString()}
            </Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons name="cash" size={24} color="#4CAF50" />
              <Text style={styles.statPercentage}>+{stats.revenueGrowth}%</Text>
            </View>
            <Text style={styles.statLabel}>Doanh thu</Text>
            <Text style={styles.statNumber}>{stats.revenue}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons name="folder-open-outline" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statLabel}>Yêu cầu rút tiền</Text>
            <Text style={styles.statNumber}>{stats.withdrawRequests}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statHeader}>
              <Ionicons name="time" size={24} color="#4CAF50" />
              <Text style={styles.statPercentage}>+{stats.sessionGrowth}%</Text>
            </View>
            <Text style={styles.statLabel}>Phiên học hôm nay</Text>
            <Text style={styles.statNumber}>{stats.todaySessions}</Text>
          </View>
        </View>

        {/* User Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản lý người dùng</Text>
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={16}
              color={COLORS.greyLight}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Tìm kiếm người dùng..."
              placeholderTextColor={COLORS.greyLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {filteredUsers.map((user: User) => (
            <View key={user.id} style={styles.userCard}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={styles.userActions}>
                <Text style={styles.amount}>{user.balance}</Text>
                <TouchableOpacity onPress={() => console.log("User:", user.id)}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={16}
                    color={COLORS.greyLight}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Withdraw Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yêu cầu rút tiền</Text>

          {withdrawRequests.map((item: WithdrawRequest) => (
            <View key={item.id} style={styles.withdrawItem}>
              <View>
                <Text style={styles.withdrawName}>{item.name}</Text>
                <Text style={styles.withdrawDate}>{item.date}</Text>
              </View>
              <View style={styles.withdrawRight}>
                <Text style={styles.withdrawAmount}>{item.amount}</Text>
                {item.status === "pending" ? (
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(item.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.approveText}>Duyệt</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.approvedText}>Đã duyệt</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thống kê</Text>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Người dùng mới</Text>
            <LineChart
              data={chartData.userChart}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: () => "#8E8E93",
                propsForDots: { r: "0" },
                fillShadowGradient: "#2196F3",
                fillShadowGradientOpacity: 0.1,
              }}
              bezier
              withDots={false}
              withShadow={true}
              withInnerLines={true}
              withOuterLines={false}
              style={styles.chart}
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Doanh thu</Text>
            <BarChart
              data={chartData.revenueChart}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 0,
                color: (opacity = 1) => `#22C55E`,
                labelColor: () => "#8E8E93",
                barPercentage: 0.6,
                fillShadowGradient: "#22C55E", 
                fillShadowGradientFromOpacity: 1,
                fillShadowGradientToOpacity: 1,
              }}
              style={styles.chart}
              withInnerLines={true}
              showValuesOnTopOfBars={false}
              yAxisLabel={""}
              yAxisSuffix={""}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#E8F4FD",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  notificationIcon: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  statBox: {
    width: "47%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  statPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    color: COLORS.dark,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.dark,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.greyLight,
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginRight: 8,
  },
  withdrawItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  withdrawName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 2,
  },
  withdrawDate: {
    fontSize: 12,
    color: COLORS.greyLight,
  },
  withdrawRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  withdrawAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginRight: 12,
  },
  approveButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: "center",
  },
  approveText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  approvedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dark,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
});
