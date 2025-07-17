import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useSessionStore } from "../../store/sessionStore";
import { useFocusEffect } from '@react-navigation/native';
import { SessionUserItem } from "../../types/session";

const { width } = require('react-native').Dimensions.get('window');

// Thêm hàm formatHourMinute
function formatHourMinute(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

const StatisticalTab = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    stasiscHoursRule,
    subjectCount,
    sessionUser,
    loading,
    error,
    getStasiscHoursRule,
    getSubjectCount,
    getSessionUser,
    reset,
  } = useSessionStore();

  useFocusEffect(
    React.useCallback(() => {
      getStasiscHoursRule();
      getSubjectCount();
      getSessionUser({ page: 1, size: pageSize });
      setCurrentPage(1);
      // Đặt reset xuống cuối cùng để không xóa mất dữ liệu vừa lấy
      // reset();
    }, [])
  );

  const totalHours = stasiscHoursRule?.totalHours || 0;
  const totalSessions = stasiscHoursRule?.totalSessions || 0;
  const totalRules = stasiscHoursRule?.totalRules || 0;

  const subjectData = subjectCount.map((item, idx) => ({
    subject: item.subject,
    hours: item.count / 60,
    color: ["#60A5FA", "#34D399", "#F59E0B", "#EF4444", "#A78BFA", "#F472B6"][idx % 6],
    percentage: 0,
  }));
  const totalSubjectHours = subjectData.reduce((sum, item) => sum + item.hours, 0);
  subjectData.forEach(item => {
    item.percentage = totalSubjectHours ? (item.hours / totalSubjectHours) * 100 : 0;
  });

  const allSessions = sessionUser?.content || [];
  const displayedSessions = allSessions;
  const totalErrors = allSessions.reduce((sum, session) => sum + (session.penaltyPoints || 0), 0);
  const totalElement = sessionUser?.totalElement || 0;

  const PieChart = () => {
    const radius = 80;
    const strokeWidth = 20;
    const center = radius + strokeWidth;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercentage = 0;

    return (
      <View style={styles.pieChartContainer}>
        <Svg width={center * 2} height={center * 2}>
          {subjectData.map((item, index) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercentage * circumference / 100;
            cumulativePercentage += item.percentage;

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${center} ${center})`}
                strokeLinecap="round"
              />
            );
          })}
          <SvgText
            x={center}
            y={center - 10}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="#2C3E50"
          >
            {formatHourMinute(totalHours)}
          </SvgText>
          <SvgText
            x={center}
            y={center + 10}
            textAnchor="middle"
            fontSize="12"
            fill="#95A5A6"
          >
            Total time
          </SvgText>
        </Svg>
      </View>
    );
  };

  const renderChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Time distribution by subject</Text>
      <View style={styles.chartContent}>
        {subjectData.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="pie-chart" size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No chart data yet</Text>
            <Text style={styles.emptySubText}>Start studying to see visual statistics</Text>
          </View>
        ) : (
          <>
            <PieChart />
            <View style={styles.legendContainer}>
              {subjectData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <View style={styles.legendText}>
                    <Text style={styles.legendSubject}>{item.subject}</Text>
                    <Text style={styles.legendHours}>
                      {item.hours.toFixed(2)}h ({item.percentage.toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderSessionItem = ({ item }: { item: SessionUserItem }) => {
    const start = new Date(item.startTime);
    const end = new Date(item.endTime);
    const dateStr = `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getFullYear()}`;
    const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    const durationHour = Math.floor(item.duration / 60);
    const durationMin = item.duration % 60;
    const durationStr = durationHour > 0 ? `${durationHour}h${durationMin > 0 ? ` ${durationMin}m` : ''}` : `${durationMin}m`;
    // Sửa lại status
    let statusLabel = '';
    let statusColor = '';
    if (item.status === 'ACTIVE') {
      statusLabel = 'Active';
      statusColor = '#4CAF50';
    } else if (item.status === 'ENDED') {
      statusLabel = 'Ended';
      statusColor = '#FF9800';
    } else if (item.status === 'FAILED') {
      statusLabel = 'Failed';
      statusColor = '#EF4444';
    } else {
      statusLabel = item.status;
      statusColor = '#888';
    }

    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionContent}>
          <View style={styles.sessionLeft}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionSubject}>{item.subject}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor + '20' } // 20 = 12% opacity
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColor }
                  ]}
                >
                  {statusLabel}
                </Text>
              </View>
            </View>
            <Text style={styles.sessionDate}>{dateStr}</Text>
            <View style={styles.sessionMeta}>
              <MaterialCommunityIcons name="clock-time-three-outline" size={12} color="#60A5FA" />
              <Text style={styles.sessionTime}>{timeStr}</Text>
              <Text style={styles.sessionDot}>•</Text>
              <Text style={styles.sessionDuration}>{durationStr}</Text>
            </View>
          </View>
          <View style={styles.sessionStats}>
              <View style={styles.statItem}>
              <Text style={styles.statLabel}>Error-Points</Text>
              <Text style={[styles.statValue, { color: item.penaltyPoints > 0 ? '#EF4444' : '#2C3E50' }]}>
                  {item.penaltyPoints}
                </Text>
              </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFE" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
          <Text style={styles.title}>Study history</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                <AntDesign name="clockcircleo" size={24} color="#60A5FA" />
              </View>
              <Text style={styles.statLabel}>Total time</Text>
              <Text style={styles.statValue}>
                {formatHourMinute(totalHours)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5E8' }]}>
                <Ionicons name="book-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statValue}>
                {totalSessions > 0 ? `${totalSessions} sessions` : '0 sessions'}
              </Text>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.statLabel}>Total errors</Text>
              <Text style={[styles.statValue, { color: totalRules > 5 ? '#EF4444' : '#2C3E50' }]}>
                {totalRules > 0 ? `${totalRules} errors` : '0 errors'}
              </Text>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          {renderChart()}
        </View>

        {/* Recent Sessions */}
        <View style={styles.sessionsSection}>
          <View style={styles.sessionsSectionHeader}>
            <Text style={styles.sectionTitle}>Recent sessions</Text>
            {/* Pagination controls */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => {
                  if (currentPage > 1) {
                    const prevPage = currentPage - 1;
                    setCurrentPage(prevPage);
                    getSessionUser({ page: prevPage, size: pageSize });
                  }
                }}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, marginRight: 12 }}
                disabled={currentPage === 1}
              >
                <Feather name="chevron-left" size={20} color="#6366F1" />
              </TouchableOpacity>
              <Text style={{ fontSize: 14, color: '#4A90E2', fontWeight: '600' }}>
                Page {currentPage} / {Math.ceil(totalElement / pageSize) || 1}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (currentPage < Math.ceil(totalElement / pageSize)) {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    getSessionUser({ page: nextPage, size: pageSize });
                  }
                }}
                style={{ opacity: currentPage === Math.ceil(totalElement / pageSize) ? 0.5 : 1, marginLeft: 12 }}
                disabled={currentPage === Math.ceil(totalElement / pageSize)}
              >
                <Feather name="chevron-right" size={20} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sessionsList}>
            {allSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="book-open" size={48} color="#D1D5DB" style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>No sessions yet</Text>
                <Text style={styles.emptySubText}>Start studying to track history</Text>
              </View>
            ) : (
              <FlatList
                data={displayedSessions}
                renderItem={renderSessionItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.sessionSeparator} />}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFE',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  scrollContentContainer: {
    paddingBottom: 120,
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '700',
    color: '#2C3E50',
  },
  // Stats Card
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginTop: -10,
    padding: 28,
    borderRadius: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  // Chart Section
  chartSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chartContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  legendContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
  legendSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  legendHours: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 2,
  },
  // Sessions Section
  sessionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sessionsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F0FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    marginRight: 4,
  },
  sessionsList: {
    flex: 1,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFE',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sessionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  sessionLeft: {
    flex: 1,
    marginRight: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 6,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTime: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 6,
  },
  sessionDot: {
    fontSize: 12,
    color: '#95A5A6',
    marginHorizontal: 8,
  },
  sessionDuration: {
    fontSize: 12,
    color: '#95A5A6',
  },
  sessionStats: {
    alignItems: 'center',
  },
  sessionSeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
});

export default StatisticalTab;