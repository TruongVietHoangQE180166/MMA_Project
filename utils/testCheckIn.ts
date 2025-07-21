import { checkInUtils } from './checkIn';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const testCheckInUtils = {
  // Reset tất cả data check-in
  resetAllData: async () => {
    await checkInUtils.resetCheckInData();
    console.log('✅ Reset all check-in data');
  },

  // Reset check-in data cho testing (dễ sử dụng)
  resetForTesting: async () => {
    try {
      await AsyncStorage.removeItem('daily_check_in');
      await AsyncStorage.removeItem('last_check_in_date');
      console.log('🧪 Reset check-in data for testing');
      console.log('📱 Bây giờ bạn có thể test lại check-in');
    } catch (error) {
      console.error('❌ Error resetting:', error);
    }
  },

  // Hiển thị tất cả AsyncStorage keys liên quan đến check-in
  showAllCheckInData: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const checkInKeys = keys.filter(key => key.includes('check') || key.includes('daily'));
      console.log('🔍 Check-in related keys:', checkInKeys);
      
      for (const key of checkInKeys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`📦 ${key}:`, value);
      }
    } catch (error) {
      console.error('❌ Error showing data:', error);
    }
  },

  // Test check-in cho ngày hôm nay
  testTodayCheckIn: async () => {
    try {
      const result = await checkInUtils.performCheckIn();
      console.log('✅ Today check-in successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Today check-in failed:', error);
      throw error;
    }
  },

  // Test check-in cho ngày hôm qua (simulate)
  testYesterdayCheckIn: async () => {
    try {
      // Simulate yesterday by temporarily setting last check-in to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await AsyncStorage.setItem('last_check_in_date', yesterday.toISOString());
      
      const result = await checkInUtils.performCheckIn();
      console.log('✅ Yesterday check-in successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Yesterday check-in failed:', error);
      throw error;
    }
  },

  // Test check-in cho 2 ngày trước (simulate)
  testTwoDaysAgoCheckIn: async () => {
    try {
      // Simulate 2 days ago
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      await AsyncStorage.setItem('last_check_in_date', twoDaysAgo.toISOString());
      
      const result = await checkInUtils.performCheckIn();
      console.log('✅ Two days ago check-in successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Two days ago check-in failed:', error);
      throw error;
    }
  },

  // Hiển thị thông tin check-in hiện tại
  showCurrentData: async () => {
    try {
      const data = await checkInUtils.getCheckInData();
      const hasCheckedIn = await checkInUtils.hasCheckedInToday();
      console.log('📊 Current check-in data:', data);
      console.log('📅 Has checked in today:', hasCheckedIn);
      return { data, hasCheckedIn };
    } catch (error) {
      console.error('❌ Error getting current data:', error);
      throw error;
    }
  },

  // Hướng dẫn sử dụng
  showUsage: () => {
    console.log('📖 Usage Guide:');
    console.log('1. Reset data: testCheckInUtils.resetForTesting()');
    console.log('2. Show current data: testCheckInUtils.showCurrentData()');
    console.log('3. Show all AsyncStorage: testCheckInUtils.showAllCheckInData()');
    console.log('4. Test today check-in: testCheckInUtils.testTodayCheckIn()');
  },
}; 