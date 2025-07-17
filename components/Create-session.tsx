import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// --- Time Picker Constants ---
const ITEM_HEIGHT = 40;
const PICKER_VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * PICKER_VISIBLE_ITEMS;

const hoursData = Array.from({ length: 24 * 3 }, (_, i) => i % 24);

const minutesData = Array.from({ length: 60 * 3 }, (_, i) => i % 60);

const middleHourIndex = Math.floor(hoursData.length / 3);
const middleMinuteIndex = Math.floor(minutesData.length / 3);

export default function CreateSession() {
  const router = useRouter();
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [cameraAI, setCameraAI] = useState(true);

  // Refs để truy cập các FlatList
  const hoursRef = useRef<FlatList>(null);
  const minutesRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => {
      if (hoursRef.current) {
        const initialScrollOffsetHours =
          ITEM_HEIGHT *
          (middleHourIndex + hours - Math.floor(PICKER_VISIBLE_ITEMS / 2));
        hoursRef.current.scrollToOffset({
          offset: initialScrollOffsetHours,
          animated: false,
        });
      }
      if (minutesRef.current) {
        const initialScrollOffsetMinutes =
          ITEM_HEIGHT *
          (middleMinuteIndex + minutes - Math.floor(PICKER_VISIBLE_ITEMS / 2));
        minutesRef.current.scrollToOffset({
          offset: initialScrollOffsetMinutes,
          animated: false,
        });
      }
    }, 10);
  }, []);

  // Xử lý khi nhấn nút "Bắt Đầu Phiên Học"
  const handleStartSession = () => {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes === 0) {
      console.warn("Study session must be at least 1 minute.");
      return;
    }

    router.push({
      pathname: "/(user)/study-session",
      params: {
        duration: totalMinutes.toString(),
        cameraEnabled: cameraAI.toString(),
      },
    });
  };

  const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;

    const firstVisibleItemIndex = Math.round(yOffset / ITEM_HEIGHT);

    const centralItemIndex =
      firstVisibleItemIndex + Math.floor(PICKER_VISIBLE_ITEMS / 2);

    const selectedHour = hoursData[centralItemIndex % hoursData.length];
    setHours(selectedHour);
  };

  const handleMinuteScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const yOffset = event.nativeEvent.contentOffset.y;

    const firstVisibleItemIndex = Math.round(yOffset / ITEM_HEIGHT);

    const centralItemIndex =
      firstVisibleItemIndex + Math.floor(PICKER_VISIBLE_ITEMS / 2);

    const selectedMinute = minutesData[centralItemIndex % minutesData.length];
    setMinutes(selectedMinute);
  };

  const totalMinutes = hours * 60 + minutes;
  const isStartButtonDisabled = totalMinutes === 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
                      source={require("../../assets/images/logo.png")}
                      style={styles.logo}
                      resizeMode="contain"
                    />
          <Text style={styles.headerTitle}>Study-Agent</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Tạo Phiên Học</Text>

        {/* Time Picker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời Lượng Học</Text>
          <View style={styles.timePickerWrapper}>
            {/* Thanh chỉ báo lựa chọn ở giữa bộ chọn */}
            <View style={styles.selectionIndicator} />
            <View style={styles.timePickerContainer}>
              {/* Hour Picker */}
              <View style={styles.pickerColumn}>
                <FlatList
                  ref={hoursRef}
                  data={hoursData}
                  renderItem={({ item }) => (
                    <View style={styles.pickerItem}>
                      <Text style={styles.pickerItemText}>
                        {String(item).padStart(2, "0")}{" "}
                        {/* Định dạng hiển thị 2 chữ số */}
                      </Text>
                    </View>
                  )}
                  keyExtractor={(_, i) => `hour-${i}`}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleHourScroll}
                  getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  style={styles.pickerList}
                  contentContainerStyle={{
                    paddingVertical:
                      ITEM_HEIGHT * Math.floor(PICKER_VISIBLE_ITEMS / 2),
                  }}
                />
                <Text style={styles.pickerLabel}>Giờ</Text>
              </View>

              {/* Dấu phân cách thời gian */}
              <Text style={styles.timeSeparator}>:</Text>

              {/* Minute Picker */}
              <View style={styles.pickerColumn}>
                <FlatList
                  ref={minutesRef}
                  data={minutesData}
                  renderItem={({ item }) => (
                    <View style={styles.pickerItem}>
                      <Text style={styles.pickerItemText}>
                        {String(item).padStart(2, "0")}{" "}
                        {/* Định dạng hiển thị 2 chữ số */}
                      </Text>
                    </View>
                  )}
                  keyExtractor={(_, i) => `minute-${i}`}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleMinuteScroll}
                  getItemLayout={(_, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                  })}
                  style={styles.pickerList}
                  contentContainerStyle={{
                    paddingVertical:
                      ITEM_HEIGHT * Math.floor(PICKER_VISIBLE_ITEMS / 2),
                  }}
                />
                <Text style={styles.pickerLabel}>Phút</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Camera AI Section */}
        <View style={styles.section}>
          <View style={styles.cameraSection}>
            <View style={styles.cameraInfo}>
              <MaterialCommunityIcons name="camera" size={24} color="#4A90E2" />
              <View style={styles.cameraText}>
                <Text style={styles.cameraTitle}>Camera AI</Text>
                <Text style={styles.cameraDescription}>
                  Bật camera để AI giám sát tập trung
                </Text>
              </View>
            </View>
            <Switch
              value={cameraAI}
              onValueChange={setCameraAI}
              trackColor={{ false: "#E0E0E0", true: "#4A90E2" }}
              thumbColor={"#FFFFFF"}
            />
          </View>
        </View>

        {/* Violations Section */}
        <Text style={styles.sectionTitle}>Quy Tắc Phạt</Text>
        <View style={styles.violationContainer}>
          <View style={styles.violationItem}>
            <MaterialCommunityIcons name="alert" size={18} color="#FF6384" />
            <Text style={styles.violationText}>Thoát ứng dụng: -100 điểm</Text>
          </View>
          <View style={styles.violationItem}>
            <MaterialCommunityIcons name="alert" size={18} color="#FF6384" />
            <Text style={styles.violationText}>Mất tập trung: -50 điểm</Text>
          </View>
          <View style={styles.violationItem}>
            <MaterialCommunityIcons name="alert" size={18} color="#FF6384" />
            <Text style={styles.violationText}>
              Sử dụng điện thoại: -30 điểm
            </Text>
          </View>
        </View>
      </View>

      {/* Start Button */}
      <TouchableOpacity
        style={[
          styles.startButton,
          isStartButtonDisabled && styles.disabledButton,
        ]}
        onPress={handleStartSession}
        disabled={isStartButtonDisabled}
      >
        <Text style={styles.startButtonText}>Bắt Đầu Phiên Học</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  cameraSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 1,
  },
  cameraInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cameraText: {
    marginLeft: 8,
    flex: 1,
  },
  cameraTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  cameraDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 1,
  },
  violationContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  violationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  violationText: {
    fontSize: 13,
    color: "#333",
    marginLeft: 8,
  },
  startButton: {
    backgroundColor: "#FF6384",
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
  // Picker styles
  timePickerWrapper: {
    height: PICKER_HEIGHT + 20, // Tăng chiều cao để tạo không gian cho nhãn
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
    position: "relative",
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: PICKER_HEIGHT,
  },
  pickerColumn: {
    alignItems: "center",
    justifyContent: "center", // Đảm bảo FlatList ở trên và label ở dưới
    height: PICKER_HEIGHT + 20, // Tăng chiều cao cột để chứa cả FlatList và label
  },
  pickerList: {
    height: PICKER_HEIGHT,
    width: 80,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#4A90E2",
    textAlign: "center",
  },
  pickerLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 8, 
    textAlign: "center",
    
  },
  timeSeparator: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A90E2",
    marginHorizontal: 15,
    marginTop: 0,
    height: ITEM_HEIGHT,
    lineHeight: ITEM_HEIGHT,
    textAlignVertical: "center",
    includeFontPadding: false,
    top: "-8%",
  },

  selectionIndicator: {
    position: "absolute",
    top: "43%",
    marginTop: -ITEM_HEIGHT / 2,
    height: ITEM_HEIGHT,
    width: "100%",
    alignSelf: "center",
    borderRadius: 12,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
  },
  logo: {
    width: 32,
    height: 32,
  },
});