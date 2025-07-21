import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  Animated,
} from "react-native";
import { usePaymentStore } from "../../store/paymentStore";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from '../../contexts/ThemeContext';
import { checkInUtils, CheckInData } from '../../utils/checkIn';
//import { DebugCheckIn } from '../../components/DebugCheckIn';

const { width } = Dimensions.get("window");

const FinanceScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amount, setAmount] = useState(0);
  const [showQRModal, setShowQRModal] = useState(false);
  const [inputError, setInputError] = useState("");
  const [amountInput, setAmountInput] = useState("");

  // Check-in states
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [showCheckInSuccessModal, setShowCheckInSuccessModal] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [fireScale] = useState(new Animated.Value(1));
  const [showStreakResetModal, setShowStreakResetModal] = useState(false);

  const {
    paymentResult,
    confirmResult,
    point,
    paymentHistory,
    totalElement,
    loading,
    error,
    createPayment,
    confirmPayment,
    getPoint,
    addPoint,
    getPaymentHistory,
    reset,
  } = usePaymentStore();

  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  useFocusEffect(
    React.useCallback(() => {
      getPoint();
      getPaymentHistory({ page: 1, size: pageSize });
      setCurrentPage(1);
      reset();
      loadCheckInData();
    }, [])
  );

  // Load check-in data
  const loadCheckInData = async () => {
    try {
      const data = await checkInUtils.getCheckInData();
      setCheckInData(data);
      const checkedIn = await checkInUtils.hasCheckedInToday();
      setHasCheckedInToday(checkedIn);
    } catch (error) {
      console.error('Error loading check-in data:', error);
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      console.log('🎯 Wallet - Starting check-in process');
      setCheckInLoading(true);
      console.log('📅 Performing check-in...');
      const prevStreak = checkInData?.currentStreak || 0;
      const newCheckInData = await checkInUtils.performCheckIn();
      console.log('✅ Check-in completed:', newCheckInData);
      setCheckInData(newCheckInData);
      setHasCheckedInToday(true);
      // Nếu streak bị reset về 1 và trước đó streak > 1 thì hiển thị modal
      if (prevStreak > 1 && newCheckInData.currentStreak === 1) {
        setShowStreakResetModal(true);
      }
      
      // Animate fire icon when check-in successful
      Animated.sequence([
        Animated.timing(fireScale, {
          toValue: 1.5,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fireScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      console.log('💰 Calling addPoint API with 1 point...');
      // Cộng 1 điểm thông qua API
      await addPoint(1);
      console.log('✅ addPoint API completed');
      
      setShowCheckInSuccessModal(true);
      setCheckInLoading(false);
    } catch (error) {
      console.error('❌ Wallet check-in error:', error);
      console.error('Error performing check-in:', error);
      setCheckInLoading(false);
    }
  };

  useEffect(() => {
    console.log("payment result: ", paymentResult)
    if (
      paymentResult &&
      paymentResult.isSuccess &&
      paymentResult.data &&
      (paymentResult.data as any).qrUrl
    ) {
      setShowQRModal(true);
    }
  }, [paymentResult]);

  useEffect(() => {
    console.log("confirm result; ", confirmResult)
    if (
      confirmResult &&
      confirmResult.isSuccess &&
      typeof confirmResult.data === "string"
    ) {
      setShowQRModal(false);
      getPoint();
      getPaymentHistory({ page: currentPage, size: pageSize });
      Alert.alert("Success", "Top-up completed!");
      reset();
    }
  }, [confirmResult]);

  const handleDeposit = () => {
    setAmount(0);
    setAmountInput("");
    setInputError("");
    setShowAmountModal(true);
  };

  const handleConfirmAmount = async () => {
    const val = Number(amountInput.replace(/[^0-9]/g, ""));
    if (!val || isNaN(val) || val < 10000 || val % 1000 !== 0) {
      setInputError(
        "Minimum 10,000 VND and must be a multiple of 1,000"
      );
      return;
    }
    setInputError("");
    setAmount(val);
    await createPayment(val);
    setShowAmountModal(false);
  };

  const handleConfirmPayment = async () => {
    await confirmPayment();
  };

  const renderTransactionItem = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.iconContainer}>
          <Feather
            name={
              item.paymentStatus === "SUCCESS"
                ? "arrow-up-right"
                : "arrow-down-right"
            }
            size={18}
            color={item.paymentStatus === "SUCCESS" ? theme.colors.success : theme.colors.error}
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionType}>
            {item.description || "Transaction"}
          </Text>
          <Text style={styles.transactionMethod}>{item.paymentMethod}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.paymentStatus === "SUCCESS" ? theme.colors.success : theme.colors.error },
          ]}
        >
          +{item.amount.toLocaleString()} VND
        </Text>
        <Text style={styles.transactionPoints}>
          +{Math.floor(item.amount / 1000)} points
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: item.paymentStatus === "SUCCESS" ? theme.colors.success + '20' : theme.colors.error + '20',
              alignSelf: "flex-end",
              marginTop: 4,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.paymentStatus === "SUCCESS" ? theme.colors.success : theme.colors.error },
            ]}
          >
            {item.paymentStatus === "SUCCESS" ? "Success" : "Failed"}
          </Text>
        </View>
      </View>
    </View>
  );

  // Phân trang: chỉ hiển thị các giao dịch của trang hiện tại
  const displayedTransactions = paymentHistory;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Transaction history</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Your Study-point</Text>
            <View style={styles.walletIconContainer}>
              <Feather name="star" size={28} color={theme.colors.primary} />
            </View>
          </View>
          <Text style={styles.balanceAmount}>{point?.toLocaleString()} points</Text>
          <View style={styles.balanceFooter}>
            <Text style={styles.equivalentText}>
              ≈ {(point * 1000)?.toLocaleString()} VND
            </Text>
          </View>
        </View>

        {/* Check-in Section */}
        <View style={styles.checkInSection}>
          <View style={styles.checkInHeader}>
            <Text style={styles.checkInTitle}>Daily Check-in</Text>
            <View style={styles.walletIconContainer}>
              <Feather name="gift" size={28} color={theme.colors.primary} />
            </View>
          </View>
          
          {/* Fire Icon Center */}
          <View style={styles.fireIconContainer}>
            <Animated.View style={{ transform: [{ scale: fireScale }] }}>
              <MaterialCommunityIcons 
                name="fire" 
                size={64} 
                color={hasCheckedInToday ? "#FF6B35" : theme.colors.textSecondary} 
              />
            </Animated.View>
            {checkInData && checkInData.currentStreak > 0 && (
              <Text style={[
                styles.streakText,
                { color: hasCheckedInToday ? "#FF6B35" : theme.colors.textSecondary }
              ]}>
                {checkInData.currentStreak} days
              </Text>
            )}
          </View>
          
          {checkInData && (
            <View style={styles.checkInStats}>
              <View style={styles.checkInStatItem}>
                <Text style={styles.checkInStatValue}>{checkInData.longestStreak}</Text>
                <Text style={styles.checkInStatLabel}>Longest Streak</Text>
              </View>
              <View style={styles.checkInStatItem}>
                <Text style={styles.checkInStatValue}>{checkInData.totalCheckIns}</Text>
                <Text style={styles.checkInStatLabel}>Total Check-ins</Text>
              </View>
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.checkInButton,
              checkInLoading && styles.checkInButtonDisabled,
              hasCheckedInToday && styles.checkInButtonDisabled
            ]}
            onPress={handleCheckIn}
            disabled={checkInLoading || hasCheckedInToday}
          >
            {checkInLoading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <View style={styles.checkInButtonContent}>
                <MaterialCommunityIcons 
                  name="calendar-check" 
                  size={20} 
                  color={hasCheckedInToday ? theme.colors.textSecondary : theme.colors.onPrimary} 
                />
                <Text style={[styles.checkInButtonText, { color: hasCheckedInToday ? theme.colors.textSecondary : theme.colors.onPrimary }] }>
                  {hasCheckedInToday
                    ? "Already Checked-in" 
                    : "Check-in Today"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Deposit Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.depositButton}
            onPress={handleDeposit}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonIcon}>
                <Feather name="plus" size={24} color={theme.colors.onPrimary} />
              </View>
              <Text style={styles.depositButtonText}>Top-up Study-point</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.historySection}>
          <View style={styles.historySectionHeader}>
            <Text style={styles.sectionTitle}>Transaction history</Text>
            {/* Pagination controls */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  if (currentPage > 1) {
                    const prevPage = currentPage - 1;
                    setCurrentPage(prevPage);
                    getPaymentHistory({ page: prevPage, size: pageSize });
                  }
                }}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, marginRight: 12 }}
                disabled={currentPage === 1}
              >
                <Feather name="chevron-left" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: theme.colors.primary, fontWeight: '600' }}>
                Page {currentPage} / {Math.ceil(totalElement / pageSize) || 1}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (currentPage < Math.ceil(totalElement / pageSize)) {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    getPaymentHistory({ page: nextPage, size: pageSize });
                  }
                }}
                style={{ opacity: currentPage === Math.ceil(totalElement / pageSize) ? 0.5 : 1, marginLeft: 12 }}
                disabled={currentPage === Math.ceil(totalElement / pageSize)}
              >
                <Feather name="chevron-right" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.transactionList}>
            <FlatList
              data={displayedTransactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Feather name="credit-card" size={48} color={theme.colors.textMuted} />
                  <Text style={styles.emptyText}>No transactions yet</Text>
                  <Text style={styles.emptySubText}>
                    Deposit points to start
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </ScrollView>

      {/* Amount Modal */}
      <Modal visible={showAmountModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter top-up amount</Text>
              <TouchableOpacity
                onPress={() => setShowAmountModal(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount (VND)</Text>
              <TextInput
                style={[styles.amountInput, inputError && styles.inputError]}
                keyboardType="numeric"
                value={amountInput}
                onChangeText={(v) => {
                  setAmountInput(v.replace(/[^0-9]/g, ""));
                  setInputError("");
                }}
                autoFocus
                placeholderTextColor={theme.colors.placeholder}
                selectionColor={theme.colors.primary}
              />

              <View style={styles.quickAmountContainer}>
                {[10000, 50000, 100000, 200000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountButton}
                    onPress={() => setAmountInput(amount.toString())}
                  >
                    <Text style={styles.quickAmountText}>
                      {amount.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.ruleText}>
                Minimum 10,000 VND and must be a multiple of 1,000
              </Text>

              {Number(amountInput) >= 10000 &&
                Number(amountInput) % 1000 === 0 && (
                  <View style={styles.conversionInfo}>
                    <Text style={styles.conversionText}>
                      Points you will receive: {Math.floor(Number(amountInput) / 1000)} points
                    </Text>
                  </View>
                )}

              {inputError && (
                <Text style={styles.errorText}>{inputError}</Text>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowAmountModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmAmount}
                style={styles.confirmButton}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.onPrimary} />
                ) : (
                  <Text style={styles.confirmButtonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </View>
      </Modal>

      {/* QR Modal */}
      <Modal visible={showQRModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContainer}>
            <View style={styles.qrModalHeader}>
              <Text style={styles.qrModalTitle}>
                Scan QR code to pay
              </Text>
              <Text style={styles.qrModalSubtitle}>
                Amount: {amount?.toLocaleString()} VND
              </Text>
            </View>

            <View style={styles.qrContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : (
                paymentResult &&
                paymentResult.data &&
                (paymentResult.data as any).qrUrl && (
                  <Image
                    source={{ uri: (paymentResult.data as any).qrUrl }}
                    style={styles.qrImage}
                    onError={e => console.log('Image load error:', e.nativeEvent)}
                  />
                )
              )}
            </View>

            {paymentResult &&
              paymentResult.data &&
              (paymentResult.data as any).note && (
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>Transfer note:</Text>
                  <Text style={styles.noteContent}>
                    {(paymentResult.data as any).note}
                  </Text>
                </View>
              )}

            <View style={styles.qrActions}>
              <TouchableOpacity
                onPress={handleConfirmPayment}
                style={styles.confirmPaymentButton}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.onPrimary} />
                ) : (
                  <Text style={styles.confirmPaymentText}>
                    Confirm payment
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowQRModal(false);
                  getPoint();
                  getPaymentHistory({ page: 1, size: pageSize });
                }}
                style={styles.closeQRButton}
              >
                <Text style={styles.closeQRText}>Close</Text>
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </View>
      </Modal>
      
      {/* Check-in Success Modal */}
      <Modal visible={showCheckInSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.checkInSuccessModalContainer}>
            <View style={styles.checkInSuccessModalHeader}>
              <MaterialCommunityIcons 
                name="check-circle" 
                size={64} 
                color={theme.colors.success} 
              />
              <Text style={styles.checkInSuccessModalTitle}>Check-in Successful!</Text>
              <Text style={styles.checkInSuccessModalSubtitle}>
                You earned 1 study point for today's check-in!
              </Text>
            </View>
            
            {checkInData && (
              <View style={styles.checkInSuccessStats}>
                <Text style={styles.checkInSuccessStatText}>
                  Current Streak: {checkInData.currentStreak} days
                </Text>
                <Text style={styles.checkInSuccessStatText}>
                  Total Check-ins: {checkInData.totalCheckIns}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.checkInSuccessButton}
              onPress={() => setShowCheckInSuccessModal(false)}
            >
              <Text style={styles.checkInSuccessButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Streak Reset Modal */}
      <Modal visible={showStreakResetModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.streakResetModalContainer}>
            <MaterialCommunityIcons name="fire" size={48} color={theme.colors.error} style={{ marginBottom: 12 }} />
            <Text style={styles.streakResetTitle}>Bạn đã bỏ lỡ chuỗi streak!</Text>
            <Text style={styles.streakResetSubtitle}>Chuỗi streak của bạn đã được đặt lại về 1.</Text>
            <TouchableOpacity
              style={styles.streakResetButton}
              onPress={() => setShowStreakResetModal(false)}
            >
              <Text style={styles.streakResetButtonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Debug Component - Commented out for now */}
    {/*<DebugCheckIn />*/}
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  scrollContentContainer: {
    paddingBottom: 120,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  balanceCard: {
    backgroundColor: theme.colors.card,
    marginTop: -10,
    padding: 28,
    borderRadius: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    fontWeight: "700",
  },
  walletIconContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 10,
    borderRadius: 12,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 8,
  },
  balanceFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  equivalentText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  actionContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  depositButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 12,
    backgroundColor: theme.colors.primary + '20',
    padding: 8,
    borderRadius: 12,
  },
  depositButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  historySection: {
    backgroundColor: theme.colors.card,
    marginTop: 8,
    marginBottom: 30,
    borderRadius: 20,
    padding: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  historySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
    marginRight: 4,
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: theme.colors.surfaceVariant,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
  },
  transactionMethod: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  transactionPoints: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    maxWidth: 380,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  quickAmountContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quickAmountButton: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    width: "48%",
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  ruleText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  conversionInfo: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  conversionText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onPrimary,
  },
  qrModalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    maxWidth: 380,
    alignItems: "center",
  },
  qrModalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  qrModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  qrModalSubtitle: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  noteContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: "100%",
  },
  noteLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  qrActions: {
    width: "100%",
  },
  confirmPaymentButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmPaymentText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  closeQRButton: {
    padding: 12,
    alignItems: "center",
  },
  closeQRText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  checkInSection: {
    backgroundColor: theme.colors.card,
    marginTop: 8,
    borderRadius: 20,
    padding: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  checkInHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  checkInStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  checkInStatItem: {
    alignItems: "center",
  },
  checkInStatValue: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  checkInStatLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  checkInButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  checkInButtonDisabled: {
    opacity: 0.7,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  checkInButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    // Màu sẽ được set động trong JSX
  },
  checkInSuccessModalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    maxWidth: 380,
    alignItems: "center",
  },
  checkInSuccessModalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  checkInSuccessModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 8,
  },
  checkInSuccessModalSubtitle: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  checkInSuccessStats: {
    marginBottom: 24,
  },
  checkInSuccessStatText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  checkInSuccessButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  checkInSuccessButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  fireIconContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  streakResetModalContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: 24,
    width: 320,
    alignItems: 'center',
  },
  streakResetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  streakResetSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  streakResetButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  streakResetButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinanceScreen;
