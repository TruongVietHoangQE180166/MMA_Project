import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECK_IN_KEY = 'daily_check_in';
const LAST_CHECK_IN_DATE_KEY = 'last_check_in_date';

export interface CheckInData {
  lastCheckInDate: string | null;
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
}

export const checkInUtils = {
  // Kiểm tra xem hôm nay đã điểm danh chưa
  hasCheckedInToday: async (): Promise<boolean> => {
    try {
      const lastCheckInDate = await AsyncStorage.getItem(LAST_CHECK_IN_DATE_KEY);
      if (!lastCheckInDate) return false;
      
      const today = new Date().toDateString();
      const lastCheckIn = new Date(lastCheckInDate).toDateString();
      
      return today === lastCheckIn;
    } catch (error) {
      console.error('Error checking check-in status:', error);
      return false;
    }
  },

  // Lấy thông tin check-in
  getCheckInData: async (): Promise<CheckInData> => {
    try {
      const checkInString = await AsyncStorage.getItem(CHECK_IN_KEY);
      const lastCheckInDate = await AsyncStorage.getItem(LAST_CHECK_IN_DATE_KEY);
      
      if (checkInString) {
        const data = JSON.parse(checkInString);
        return {
          ...data,
          lastCheckInDate: lastCheckInDate,
        };
      }
      
      return {
        lastCheckInDate: null,
        totalCheckIns: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    } catch (error) {
      console.error('Error getting check-in data:', error);
      return {
        lastCheckInDate: null,
        totalCheckIns: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }
  },

  // Thực hiện điểm danh
  performCheckIn: async (): Promise<CheckInData> => {
    try {
      const today = new Date().toISOString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString();
      
      // Lấy dữ liệu hiện tại
      const currentData = await checkInUtils.getCheckInData();
      
      // Tính toán streak
      let newCurrentStreak = currentData.currentStreak;
      let newLongestStreak = currentData.longestStreak;
      
      if (currentData.lastCheckInDate) {
        const lastCheckIn = new Date(currentData.lastCheckInDate);
        const lastCheckInDate = lastCheckIn.toDateString();
        const yesterdayDate = yesterday.toDateString();
        
        if (lastCheckInDate === yesterdayDate) {
          // Điểm danh liên tục
          newCurrentStreak = currentData.currentStreak + 1;
        } else if (lastCheckInDate !== new Date().toDateString()) {
          // Bỏ lỡ ngày, reset streak
          newCurrentStreak = 1;
        }
      } else {
        // Lần đầu điểm danh
        newCurrentStreak = 1;
      }
      
      // Cập nhật longest streak
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
      
      // Tạo dữ liệu mới
      const newData: CheckInData = {
        lastCheckInDate: today,
        totalCheckIns: currentData.totalCheckIns + 1,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
      };
      
      // Lưu vào AsyncStorage
      await AsyncStorage.setItem(CHECK_IN_KEY, JSON.stringify(newData));
      await AsyncStorage.setItem(LAST_CHECK_IN_DATE_KEY, today);
      
      return newData;
    } catch (error) {
      console.error('Error performing check-in:', error);
      throw new Error('Failed to perform check-in');
    }
  },

  // Reset check-in data (cho testing)
  resetCheckInData: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CHECK_IN_KEY);
      await AsyncStorage.removeItem(LAST_CHECK_IN_DATE_KEY);
    } catch (error) {
      console.error('Error resetting check-in data:', error);
    }
  },
}; 