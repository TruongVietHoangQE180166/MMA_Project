import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function AdminHome() {
  const { user } = useAuthStore();
  const screenWidth = Dimensions.get('window').width;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <Ionicons name="people" size={24} color="#2196F3" />
            <Text style={styles.statPercentage}>+12%</Text>
          </View>
          <Text style={styles.statLabel}>Tổng người dùng</Text>
          <Text style={styles.statNumber}>2,451</Text>
        </View>
        
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <FontAwesome5 name="money-bill-wave" size={24} color='#00FF00' />
            <Text style={styles.statPercentage}>+8%</Text>
          </View>
          <Text style={styles.statLabel}>Doanh thu</Text>
          <Text style={styles.statNumber}>15.2M</Text>
        </View>
        
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <Ionicons name="wallet-outline" size={24} color="orange" />
            <Text style={styles.statNumber12}>12</Text>
          </View>
          <Text style={styles.statLabel}>Yêu cầu rút tiền</Text>
          <Text style={styles.statNumber}>8</Text>
        </View>
        
        <View style={styles.statBox}>
          <View style={styles.statHeader}>
            <Ionicons name="time" size={24} color="#9C27B0" />
            <Text style={styles.statPercentage}>+25%</Text>
          </View>
          <Text style={styles.statLabel}>Phiên học hôm nay</Text>
          <Text style={styles.statNumber}>142</Text>
        </View>
      </View>

      {/* User Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quản lý người dùng</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput 
            style={styles.input} 
            placeholder="Tìm kiếm người dùng..." 
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.userCard}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Nguyễn Văn A</Text>
            <Text style={styles.userEmail}>nguyenvana@gmail.com</Text>
          </View>
          <View style={styles.userActions}>
            <Text style={styles.amount}>120.000đ</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={16} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.userCard}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/women/2.jpg' }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Trần Thị B</Text>
            <Text style={styles.userEmail}>tranb@gmail.com</Text>
          </View>
          <View style={styles.userActions}>
            <Text style={styles.amount}>350.000đ</Text>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={16} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Withdraw Requests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yêu cầu rút tiền</Text>
        
        <View style={styles.withdrawItem}>
          <View>
            <Text style={styles.withdrawName}>Lê Văn C</Text>
            <Text style={styles.withdrawDate}>23/02/2024</Text>
          </View>
          <View style={styles.withdrawRight}>
            <Text style={styles.withdrawAmount}>200.000đ</Text>
            <TouchableOpacity style={styles.approveButton}>
              <Text style={styles.approveText}>Duyệt</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.withdrawItem}>
          <View>
            <Text style={styles.withdrawName}>Phạm Thị D</Text>
            <Text style={styles.withdrawDate}>23/02/2024</Text>
          </View>
          <View style={styles.withdrawRight}>
            <Text style={styles.withdrawAmount}>500.000đ</Text>
            <TouchableOpacity style={styles.approveButton}>
              <Text style={styles.approveText}>Duyệt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống kê</Text>

        {/* Liner Chart - Thong ke */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Người dùng mới</Text>
          <LineChart
            data={{
              labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
              datasets: [
                {
                  data: [400, 300, 500, 350, 600, 800, 700],
                },
              ],
            }}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: () => '#8E8E93',
              propsForDots: {
                r: '0',
              },
              fillShadowGradient: '#2196F3',
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


        {/* Bar Chart - Doanh thu */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Doanh thu</Text>
          <BarChart
              data={{
                labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
                datasets: [
                  {
                    data: [1100, 850, 1350, 1650, 950, 2000, 1550],
                  },
                ],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 0,
                color: (_opacity = 1) => `#22C55E`,
                labelColor: () => "#8E8E93",
                barPercentage: 0.6,
                fillShadowGradient: "#22C55E",
                fillShadowGradientFromOpacity: 1,
                fillShadowGradientToOpacity: 1,
              }}
              style={styles.chart}
              withInnerLines={true} yAxisLabel={''} yAxisSuffix={''}              />
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    paddingBottom: SIZES.padding,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  notificationIcon: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  statBox: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  statNumber12: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  statPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.dark,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.gray,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight: 8,
  },
  withdrawItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  withdrawName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 2,
  },
  withdrawDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  withdrawRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  withdrawAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight: 12,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
  bottomSpacing: {
    height: 100,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 34,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#8E8E93',
  },
});