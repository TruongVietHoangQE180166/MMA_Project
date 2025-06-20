import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StudySession() {
  const router = useRouter(); // Hook để điều hướng
  const params = useLocalSearchParams(); // Hook để lấy tham số từ URL

  // Lấy tham số duration và cameraEnabled từ navigation
  // Chuyển đổi duration sang số nguyên, mặc định là 45 phút nếu không có
  const duration = parseInt(params.duration as string) || 45;
  // Chuyển đổi cameraEnabled sang boolean
  const cameraEnabled = params.cameraEnabled === "true";

  // Trạng thái của đồng hồ đếm ngược
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Thời gian còn lại tính bằng giây
  const [isActive, setIsActive] = useState(true); // Đồng hồ có đang chạy không (mặc định là true)
  const [isPaused, setIsPaused] = useState(false); // Đồng hồ có đang tạm dừng không
  const [showWarning, setShowWarning] = useState(false); // Trạng thái hiển thị cảnh báo

  // Hàm định dạng thời gian thành MM:SS
  const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

  // useEffect để quản lý đồng hồ đếm ngược
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    // Nếu đồng hồ đang hoạt động, không tạm dừng và còn thời gian
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1); // Giảm thời gian còn lại mỗi giây
      }, 1000); // Chạy mỗi 1000ms (1 giây)
    } else if (timeRemaining === 0) {
      // Nếu hết thời gian, dừng đồng hồ
      setIsActive(false);
    }

    // Hàm dọn dẹp khi component unmount hoặc khi dependency thay đổi
    return () => {
      if (interval) clearInterval(interval); // Xóa interval để tránh rò rỉ bộ nhớ
    };
  }, [isActive, isPaused, timeRemaining]); // Dependencies của useEffect

  // useEffect để hiển thị cảnh báo khi còn 5 phút
  useEffect(() => {
    // Hiển thị cảnh báo nếu thời gian còn lại dưới hoặc bằng 5 phút (300 giây)
    // và lớn hơn 0 (chưa hết giờ) và đồng hồ đang hoạt động
    if (timeRemaining <= 300 && timeRemaining > 0 && isActive) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [timeRemaining, isActive]); // Dependencies của useEffect

  // Xử lý khi nhấn nút "Kết thúc sớm"
  const handleEndEarly = () => {
    router.back(); // Quay lại màn hình trước
  };

  // Xử lý khi nhấn nút "Tạm dừng" / "Tiếp tục" / "Bắt đầu"
  const handlePauseResume = () => {
    if (!isActive && timeRemaining > 0) {
      setIsActive(true); 
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Phiên học</Text>
        <TouchableOpacity onPress={() => {}}>
          <MaterialCommunityIcons name="cog-outline" size={28} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Timer Circle */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, { borderColor: "#4A90E2" }]}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>còn lại</Text>
          </View>
        </View>

        {/* Session Info */}
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>Phiên học: Toán học</Text>
          <Text style={styles.sessionDuration}>
            Thời gian cam kết: {duration} phút
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Focus Warning */}
        {showWarning && (
          <View style={styles.warningContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color="#D97706"
            />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>
                Sắp hết thời gian miễn phạt!
              </Text>
              <Text style={styles.warningSubtitle}>
                Còn 5 phút để hoàn thành phiên học
              </Text>
            </View>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, styles.endButton]}
            onPress={handleEndEarly} // Xử lý khi kết thúc sớm
          >
            <Text style={styles.endButtonText}>Kết thúc sớm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePauseResume} // Xử lý tạm dừng/tiếp tục
          >
            <Text style={styles.pauseButtonText}>
              {!isActive ? "Bắt đầu" : isPaused ? "Tiếp tục" : "Tạm dừng"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA", // Light grey background like in the image
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50, // For safe area
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600", // Semibold
    color: "#333",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    alignItems: "center",
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 7,
    borderColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },

  timerText: {
    fontSize: 30,
    fontWeight: "600",
    color: "#333",
  },

  timerLabel: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
    textTransform: "lowercase",
  },

  sessionInfo: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sessionDuration: {
    fontSize: 16,
    color: "#666",
  },
  bottomSection: {
    paddingBottom: 40, // Safe area space at the bottom
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E5", // Light yellow background
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#B45309", // Darker orange for text
  },
  warningSubtitle: {
    fontSize: 13,
    color: "#B45309",
    marginTop: 4,
  },
  controlButtons: {
    gap: 15,
  },
  controlButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  endButton: {
    backgroundColor: "#FF6384",
  },
  endButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  pauseButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#4A90E2",
  },
  pauseButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  logo: {
    width: 32,
    height: 32,
  },
});
