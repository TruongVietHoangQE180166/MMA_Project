import { AntDesign, Foundation, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';

const HistoryTab = () => {
  const [activeTab, setActiveTab] = useState('Ngày');

  const chartData = [4, 3, 5, 2, 6, 4, 3];
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  const recentSessions = [
    {
      subject: 'Toán học',
      date: '15/12/2023',
      time: '09:30 - 11:30',
      duration: '2 giờ',
      score: 95
    },
    {
      subject: 'Vật lý',
      date: '15/12/2023',
      time: '14:00 - 16:00',
      duration: '2 giờ',
      score: 88
    },
    {
      subject: 'Hóa học',
      date: '14/12/2023',
      time: '08:00 - 10:30',
      duration: '2.5 giờ',
      score: 92
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#60A5FA';
    if (score >= 85) return '#60A5FA';
    return '#60A5FA';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E0F2FE" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Lịch sử học tập</Text>
        </View>

        {/* Card 1*/}
        <View style={styles.statsCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <AntDesign name="clockcircleo" size={24} color="#00aff0" />
              </View>
              <Text style={styles.statLabel}>Tổng thời gian</Text>
              <Text style={styles.statValue}>24h 30p</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="book-outline" size={24} color="orange" />
              </View>
              <Text style={styles.statLabel}>Số phiên</Text>
              <Text style={styles.statValue}>15 phiên</Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Foundation name="graph-bar" size={24} color="#00aff0" />
              </View>
              <Text style={styles.statLabel}>Điểm tập trung</Text>
              <Text style={styles.statValue}>85%</Text>
            </View>
          </View>
        </View>

        {/* Card 2*/}
        <View style={styles.chartCard}>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {['Ngày', 'Tuần', 'Tháng'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartArea}>
              <View style={styles.yAxisLine} />
              <View style={styles.xAxisLine} />
              <View style={styles.gridLines}>
                {[8, 6, 4, 2].map((value, _index) => {
                  const topPosition = ((8 - value) / 8) * 100; // Tính vị trí chính xác
                  return (
                    <View key={value} style={[styles.gridLineRow, { top: `${topPosition}%` }]}>
                      <View style={styles.horizontalLine} />
                    </View>
                  );
                })}
              </View>

              {/* Y-axis labels */}
              <View style={styles.yAxisLabels}>
                {[8, 6, 4, 2, 0].map((value, _index) => (
                  <Text key={value} style={styles.yLabel}>{value}</Text>
                ))}
              </View>

              {/* Bars container */}
              <View style={styles.barsContainer}>
                {chartData.map((value, index) => {
                  const heightPercentage = (value / 8) * 100;
                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View style={[styles.bar, { height: `${heightPercentage}%` }]} />
                    </View>
                  );
                })}
              </View>
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxisLabels}>
              {labels.map((label, index) => (
                <Text key={index} style={styles.barLabel}>{label}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Card 3 */}
         <Text style={styles.sessionsTitle}>Các phiên học gần đây</Text>
        <View style={styles.sessionsContainer}>
          {recentSessions.map((session, index) => (
            <View key={index} style={styles.sessionCard}>
              <View style={styles.sessionContent}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionSubject}>{session.subject}</Text>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                  <View style={styles.sessionMeta}>
                    <Text style={styles.sessionTime}>
                      <MaterialCommunityIcons name="clock-time-three-outline" size={12} color="#00aff0" /> {session.time}
                    </Text>
                    <Text style={styles.sessionDot}>•</Text>
                    <Text style={styles.sessionDuration}>{session.duration}</Text>
                  </View>
                </View>

                <View style={styles.scoreContainer}>
                  <Text style={[styles.sessionScore, { color: getScoreColor(session.score) }]}>
                    {session.score}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F2FE',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },

  // Card 1
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Card 2
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    marginTop: 0,
  },
  tab: {
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  activeTab: {
    backgroundColor: '#60A5FA',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },

  // Chart
  chartContainer: {
    height: 220,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  chartArea: {
    height: 160,
    marginLeft: 30,
    position: 'relative',
  },

  // Trục Y
  yAxisLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#9CA3AF',
    zIndex: 1,
  },

  // Trục X
  xAxisLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: '#9CA3AF',
    zIndex: 1,
  },

  // Grid lines
  gridLines: {
    position: 'absolute',
    left: 2,
    right: 0,
    top: 0,
    bottom: 2,
    height: '100%',
    zIndex: 0,
  },

  gridLineRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },

  horizontalLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    borderStyle: 'dashed',
  },

  // Labels trục Y
  yAxisLabels: {
    position: 'absolute',
    left: -28,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },

  yLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
    textAlign: 'right',
    width: 20,
    height: 20,
    textAlignVertical: 'center',
    marginTop: -10,
  },

  // Container bars
  barsContainer: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 2,
    top: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    zIndex: 2,
  },

  barWrapper: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 40,
    height: '100%',
    justifyContent: 'flex-end',
  },

  bar: {
    width: 28,
    backgroundColor: '#60A5FA',
    minHeight: 2,
  },

  // Labels trục X
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    marginLeft: 30,
    paddingHorizontal: 8,
  },

  barLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Card 3
  sessionsCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sessionBorder: {
    borderBottomWidth: 0,
  },
  sessionLeft: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionDot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 8,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scoreContainer: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  sessionScore: {
    fontSize: 18,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 100,
  },
  sessionsContainer: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  sessionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default HistoryTab;