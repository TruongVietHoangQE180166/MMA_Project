import AntDesign from "@expo/vector-icons/AntDesign";
import { NavigationProp } from "@react-navigation/native";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ViolationHistoryScreenProps {
  navigation: NavigationProp<any>;
}

interface ViolationItem {
  id: number;
  date: string;
  violation: string;
  amount: number;
}

const ViolationHistoryScreen: React.FC<ViolationHistoryScreenProps> = ({
  navigation,
}) => {
  const violationData: ViolationItem[] = [
    {
      id: 1,
      date: "15/12/2023 - 09:45",
      violation: "Thoát khỏi ứng dụng trong phiên học",
      amount: -50000,
    },
    {
      id: 2,
      date: "14/12/2023 - 14:30",
      violation: "Mở ứng dụng khác trong phiên học",
      amount: -30000,
    },
    {
      id: 3,
      date: "13/12/2023 - 11:20",
      violation: "Tắt màn hình trong phiên học",
      amount: -20000,
    },
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const renderViolationItem = (item: ViolationItem) => (
    <View key={item.id} style={styles.violationItem}>
      <View style={styles.warningIcon}>
        <AntDesign name="warning" size={20} color="red" />
      </View>
      <View style={styles.violationContent}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.violationText}>{item.violation}</Text>
      </View>
      <Text style={styles.amountText}>-{formatCurrency(item.amount)} đ</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="left" size={24} color="black" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Lịch sử vi phạm</Text>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tổng số lần vi phạm: 3</Text>
          <Text style={styles.summaryAmount}>
            Tổng số tiền bị trừ: 100.000 đ
          </Text>
        </View>

        {/* Violation List */}
        <View style={styles.violationList}>
          {violationData.map(renderViolationItem)}
        </View>
      </ScrollView>

      {/* Fixed Chart at bottom */}
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          <View
            style={[styles.bar1, { height: 75, backgroundColor: "#FF6B6B" }]}
          />
          <View
            style={[styles.bar, { height: 100, backgroundColor: "#4ECDC4" }]}
          />
          <View
            style={[styles.bar1, { height: 75, backgroundColor: "#FF6B6B" }]}
          />
          <View
            style={[styles.bar, { height: 100, backgroundColor: "#4ECDC4" }]}
          />
          <View
            style={[styles.bar1, { height: 75, backgroundColor: "#FF6B6B" }]}
          />
          <View
            style={[styles.bar, { height: 100, backgroundColor: "#4ECDC4" }]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F4FD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#E8F4FD",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginRight: 40,
  },
  logo: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 130, // Để tránh bị chart che nội dung
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 14,
    color: "#666",
  },
  violationList: {
    gap: 12,
    marginBottom: 16,
  },
  violationItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningIcon: {
    marginRight: 12,
  },
  violationContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  violationText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  amountText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  chartContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    justifyContent: "flex-end",
    backgroundColor: "#E8F4FD",
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "center",
    columnGap: 8,
    height: 100,
  },
  bar: {
    width: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  bar1:{
    width: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: "flex-start",
  },
});

export default ViolationHistoryScreen;