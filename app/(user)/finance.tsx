import { Feather, Ionicons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

const FinanceScreen = () => {
  const transactionHistory = [
    {
      id: 1,
      type: "VNPay",
      time: "10:30 AM - 15/01/2024",
      amount: "+50,000 đ",
      status: "Thành công",
      icon: <Ionicons name="trending-up" size={24} color="green" />,
      color: "#4CAF50",
    },
    {
      id: 2,
      type: "Momo",
      time: "09:15 AM - 14/01/2024",
      amount: "-30,000 đ",
      status: "Thành công",
      icon: <Ionicons name="trending-down" size={24} color="red" />,
      color: "#F44336",
    },
    {
      id: 3,
      type: "Phạt thoát app",
      time: "14:20 PM - 14/01/2024",
      amount: "-10,000 đ",
      status: "Đã trừ",
      icon: (
        <FontAwesome6 name="money-bill-transfer" size={20} color="orange" />
      ),
      color: "#FF9800",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#C8E6F5" barStyle="dark-content" />
      <View style={styles.statusBarBackground} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>Tài Chính</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={24} color="blue" />
            </Text>
            <Text style={styles.balanceAmount}>100,000 đ</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.depositButton}>
            <Text style={styles.buttonIcon}>
              <Feather name="arrow-up-circle" size={24} color="white" />
            </Text>
            <Text style={styles.depositButtonText}>Nạp tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.buttonIcon}>
              <Feather name="arrow-down-circle" size={24} color="white" />
            </Text>
            <Text style={styles.withdrawButtonText}>Rút tiền</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          <TouchableOpacity style={styles.paymentMethod}>
            <View style={[styles.paymentIcon, { backgroundColor: "#2196F3" }]}>
              <Text style={styles.paymentIconText}>VN</Text>
            </View>
            <Text style={styles.paymentMethodText}>VNPay</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.paymentMethod}>
            <View style={[styles.paymentIcon, { backgroundColor: "#E91E63" }]}>
              <Text style={styles.paymentIconText}>M</Text>
            </View>
            <Text style={styles.paymentMethodText}>Momo</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>

          {transactionHistory.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionIcon}>{transaction.icon}</Text>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionType}>{transaction.type}</Text>
                  <View style={styles.timeContainer}>
                    <Text style={styles.clockIcon}>🕙</Text>
                    <Text style={styles.transactionTime}>
                      {transaction.time}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: transaction.color },
                  ]}
                >
                  {transaction.amount}
                </Text>
                <Text style={styles.transactionStatus}>
                  {transaction.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 6 Gradient Columns */}
        <View style={styles.columnsContainer}>
      {[...Array(6)].map((_, index) => (
        <LinearGradient
          key={index}
          colors={['rgba(255, 182, 193, 0.42)', 'rgb(173,216,230)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.column}
        />
      ))}
    </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C8E6F5",
  },
  statusBarBackground: {
    height: 44,
    backgroundColor: "#C8E6F5",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#C8E6F5",
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#C8E6F5",
    borderBottomWidth: 0,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2196F3",
  },
  balanceCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  walletIcon: {
    fontSize: 24,
  },
  buttonIcon: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  depositButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  depositButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: "#FF5722",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  withdrawButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentIconText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  chevronIcon: {
    fontSize: 20,
    color: "#666",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  transactionTime: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  clockIcon: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  transactionStatus: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  // New styles for columns
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 20,
    height: 120,
  },
  column: {
    width: 40,
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default FinanceScreen;