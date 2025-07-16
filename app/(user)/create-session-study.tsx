import { navigate } from "@/utils/navigation";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSessionStore } from "../../store/sessionStore";

const { width: screenWidth } = Dimensions.get("window");

const subjects = [
  { id: 1, name: "Mathematics", icon: "calculator", color: "#FF6B6B" },
  { id: 2, name: "Science", icon: "flask", color: "#4ECDC4" },
  { id: 3, name: "English", icon: "book-open-page-variant", color: "#45B7D1" },
  { id: 4, name: "History", icon: "castle", color: "#96CEB4" },
  { id: 5, name: "Geography", icon: "earth", color: "#FECA57" },
  { id: 6, name: "Physics", icon: "atom", color: "#A8E6CF" },
  { id: 7, name: "Chemistry", icon: "test-tube", color: "#FFB6C1" },
  { id: 8, name: "Biology", icon: "leaf", color: "#DDA0DD" },
];

// Quick time options (optional shortcuts)
const quickTimeOptions = [
  { hours: 0, minutes: 25, label: "25m" },
  { hours: 0, minutes: 50, label: "50m" },
  { hours: 1, minutes: 30, label: "1h 30m" },
  { hours: 2, minutes: 0, label: "2h" },
  { hours: 0, minutes: 1, label: "1m" },
];

// Định nghĩa hàm formatHourMinute
function formatHourMinute(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

export default function CreateSession() {
  const router = useRouter();
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [cameraAI, setCameraAI] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [customSubjectError, setCustomSubjectError] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { createSession } = useSessionStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSession = async () => {
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes === 0) {
      console.warn("Study session must be at least 1 minute.");
      return;
    }
    if (
      showCustomInput &&
      customSubject.trim() !== "" &&
      customSubject.trim().length < 2
    ) {
      setCustomSubjectError("Subject name must be at least 2 characters.");
      return;
    }
    setCustomSubjectError("");
    // Xóa sạch mọi key liên quan đến phiên cũ
    await AsyncStorage.removeItem("CURRENT_STUDY_SESSION");
    await AsyncStorage.removeItem("LAST_ACTIVE_TIME");
    const allKeys = await AsyncStorage.getAllKeys();
    const statsKeys = allKeys.filter((k) =>
      k.startsWith("CURRENT_STUDY_SESSION_STATS_")
    );
    if (statsKeys.length > 0) await AsyncStorage.multiRemove(statsKeys);

    // Gọi API tạo session
    const subjectName = showCustomInput && customSubject.trim() !== ""
      ? customSubject
      : selectedSubject.name;
    try {
      const res = await createSession({
        subject: subjectName,
        durationMinutes: totalMinutes,
        aiEnabled: false,
      });
      console.log('Create session response:', res);
      if (res && res.isSuccess && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
        const sessionId = (res.data as any).id;
        if (!sessionId) {
          alert('Session created but no sessionId returned!');
        }
        // Lưu local session như cũ
        const sessionKey = Date.now().toString();
        const sessionData = {
          startTime: Date.now(),
          duration: totalMinutes * 60, // giây
          subject: subjectName,
          sessionKey,
          sessionId,
        };
        await AsyncStorage.setItem(
          "CURRENT_STUDY_SESSION",
          JSON.stringify(sessionData)
        );
        router.push({
          pathname: "/(user)/StudySession",
          params: {
            duration: totalMinutes.toString(),
            subject: sessionData.subject,
            sessionKey,
            sessionId,
          },
        });
      } else {
        alert(res?.message?.messageDetail || "Failed to create session");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to create session");
    }
  };

  const handleQuickTimeSelect = (timeOption: (typeof quickTimeOptions)[0]) => {
    setHours(timeOption.hours);
    setMinutes(timeOption.minutes);
  };

  const handleAddCustomSubject = () => {
    setShowCustomInput(true);
    setSelectedSubject({ id: 0, name: "", icon: "book", color: "#6C63FF" }); // Reset selection
  };

  const handleSubjectSelect = (subject: (typeof subjects)[0]) => {
    setSelectedSubject(subject);
    setShowCustomInput(false);
    setCustomSubject("");
    setCustomSubjectError("");
  };

  const incrementHours = () => {
    setHours((prev) => Math.min(prev + 1, 12)); // Max 12 hours
  };

  const decrementHours = () => {
    setHours((prev) => Math.max(prev - 1, 0));
  };

  const incrementMinutes = () => {
    setMinutes((prev) => {
      const newMinutes = prev + 5; // Increment by 5 minutes
      return newMinutes >= 60 ? 0 : newMinutes;
    });
  };

  const decrementMinutes = () => {
    setMinutes((prev) => {
      const newMinutes = prev - 5; // Decrement by 5 minutes
      return newMinutes < 0 ? 55 : newMinutes;
    });
  };

  const totalMinutes = hours * 60 + minutes;
  const isStartButtonDisabled = totalMinutes === 0;

  return (
    <View style={styles.container}>
      {/* Enhanced Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>Study Agent</Text>
              <Text style={styles.headerSubtitle}>Focus & Achieve</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigate.back()}
          >
            <MaterialCommunityIcons name="close" size={26} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Study Session</Text>
            <Text style={styles.subtitle}>
              Set up your focused learning time
            </Text>
          </View>

          {/* Subject Selection - Updated */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={20}
                color="#4A90E2"
              />{" "}
              Choose Subject
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subjectScroll}
            >
              <View style={styles.subjectContainer}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectItem,
                      selectedSubject.id === subject.id &&
                        !showCustomInput &&
                        styles.selectedSubject,
                    ]}
                    onPress={() => handleSubjectSelect(subject)}
                  >
                    <View
                      style={[
                        styles.subjectIcon,
                        selectedSubject.id === subject.id &&
                          !showCustomInput && {
                            backgroundColor: `${subject.color}20`,
                          },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={subject.icon as any}
                        size={24}
                        color={
                          selectedSubject.id === subject.id && !showCustomInput
                            ? subject.color
                            : "#A0AEC0"
                        }
                      />
                    </View>
                    <Text
                      style={[
                        styles.subjectText,
                        selectedSubject.id === subject.id &&
                          !showCustomInput && {
                            color: subject.color,
                            fontWeight: "bold",
                          },
                      ]}
                    >
                      {subject.name}
                    </Text>
                  </TouchableOpacity>
                ))}

                {/* Add Custom Subject Button */}
                <TouchableOpacity
                  style={[
                    styles.subjectItem,
                    styles.addCustomButton,
                    showCustomInput && styles.selectedSubject,
                  ]}
                  onPress={handleAddCustomSubject}
                >
                  <View
                    style={[
                      styles.subjectIcon,
                      styles.addCustomIcon,
                      showCustomInput && { backgroundColor: "#6C63FF20" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color={showCustomInput ? "#6C63FF" : "#A0AEC0"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.subjectText,
                      styles.addCustomText,
                      showCustomInput && {
                        color: "#6C63FF",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Add Custom
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Custom Subject Input - Only show when Add Custom is clicked */}
            {showCustomInput && (
              <View style={styles.customSubjectContainer}>
                <Text style={styles.customSubjectLabel}>
                  Enter your custom subject:
                </Text>
                <TextInput
                  style={[
                    styles.customSubjectInput,
                    customSubjectError ? styles.customSubjectInputError : null,
                  ]}
                  placeholder="Type your subject name..."
                  value={customSubject}
                  onChangeText={(text) => {
                    setCustomSubject(text);
                    setCustomSubjectError("");
                  }}
                  maxLength={30}
                  placeholderTextColor="#A0AEC0"
                  autoFocus={true}
                />
                {customSubjectError ? (
                  <Text style={styles.customSubjectError}>
                    {customSubjectError}
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {/* Improved Custom Time Picker */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#4A90E2"
              />{" "}
              Study Duration
            </Text>

            {/* Main Time Selectors */}
            <View style={styles.timePickerContainer}>
              {/* Hours Selector */}
              <View style={styles.timeSelector}>
                <Text style={styles.timeSelectorLabel}>Hours</Text>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity
                    style={[styles.timeButton, styles.topButton]}
                    onPress={incrementHours}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="chevron-up"
                      size={28}
                      color="#FFF"
                    />
                  </TouchableOpacity>

                  <View style={styles.timeValueContainer}>
                    <Text style={styles.timeValue}>
                      {String(hours).padStart(2, "0")}
                    </Text>
                    <Text style={styles.timeUnit}>hrs</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.timeButton, styles.bottomButton]}
                    onPress={decrementHours}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={28}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Separator */}
              <View style={styles.timeSeparator}>
                <Text style={styles.colonText}>:</Text>
              </View>

              {/* Minutes Selector */}
              <View style={styles.timeSelector}>
                <Text style={styles.timeSelectorLabel}>Minutes</Text>
                <View style={styles.timeInputContainer}>
                  <TouchableOpacity
                    style={[styles.timeButton, styles.topButton]}
                    onPress={incrementMinutes}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="chevron-up"
                      size={28}
                      color="#FFF"
                    />
                  </TouchableOpacity>

                  <View style={styles.timeValueContainer}>
                    <Text style={styles.timeValue}>
                      {String(minutes).padStart(2, "0")}
                    </Text>
                    <Text style={styles.timeUnit}>mins</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.timeButton, styles.bottomButton]}
                    onPress={decrementMinutes}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={28}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Quick Time Options */}
            <View style={styles.quickTimeSection}>
              <Text style={styles.quickTimeTitle}>Quick Select:</Text>
              <View style={styles.quickTimeContainer}>
                {quickTimeOptions.map((timeOption, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickTimeButton}
                    onPress={() => handleQuickTimeSelect(timeOption)}
                  >
                    <Text style={styles.quickTimeButtonText}>
                      {timeOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Total Time Display */}
            <View style={styles.totalTimeContainer}>
              <MaterialCommunityIcons name="timer" size={20} color="#4A90E2" />
              <Text style={styles.totalTimeText}>
                Total:{" "}
                {totalMinutes > 0
                  ? `${totalMinutes} minutes`
                  : "Select duration"}
              </Text>
            </View>
          </View>

          {/* Enhanced Camera AI Section */}
          <View style={styles.card}>
            <View style={styles.cameraSection}>
              <View style={styles.cameraInfo}>
                <View style={styles.cameraIconContainer}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={28}
                    color="#4A90E2"
                  />
                </View>
                <View style={styles.cameraText}>
                  <Text style={styles.cameraTitle}>AI Camera Monitor</Text>
                  <Text style={styles.cameraDescription}>
                    Enable camera for AI-powered focus tracking
                  </Text>
                </View>
              </View>
              <Switch
                value={cameraAI}
                onValueChange={setCameraAI}
                trackColor={{ false: "#E0E0E0", true: "#4A90E2" }}
                thumbColor={"#FFFFFF"}
                style={styles.switch}
              />
            </View>
          </View>

          {/* Enhanced Penalty Rules */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              <MaterialCommunityIcons
                name="shield-alert"
                size={20}
                color="#FF6B6B"
              />{" "}
              Penalty Rules
            </Text>
            <View style={styles.violationContainer}>
              <View style={styles.violationItem}>
                <View style={styles.violationIcon}>
                  <MaterialCommunityIcons
                    name="exit-to-app"
                    size={20}
                    color="#FF6B6B"
                  />
                </View>
                <Text style={styles.violationText}>Exit app: -100 points</Text>
              </View>
              <View style={styles.violationItem}>
                <View style={styles.violationIcon}>
                  <MaterialCommunityIcons
                    name="eye-off"
                    size={20}
                    color="#FF9500"
                  />
                </View>
                <Text style={styles.violationText}>Lose focus: -50 points</Text>
              </View>
              <View style={styles.violationItem}>
                <View style={styles.violationIcon}>
                  <MaterialCommunityIcons
                    name="cellphone"
                    size={20}
                    color="#FF6B6B"
                  />
                </View>
                <Text style={styles.violationText}>
                  Phone usage: -30 points
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Start Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            (isStartButtonDisabled || isLoading) && styles.disabledButton,
          ]}
          onPress={() => setShowConfirmModal(true)}
          disabled={isStartButtonDisabled || isLoading}
        >
          <MaterialCommunityIcons
            name="rocket-launch"
            size={24}
            color="#FFF"
            style={styles.buttonIcon}
          />
          <Text style={styles.startButtonText}>
            {isLoading ? "Loading..." : "Start Study Session"}
          </Text>
          {isLoading && <ActivityIndicator size="small" color="#FFF" style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </View>
      {/* Modal xác nhận bắt đầu học */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', width: 300 }}>
            <MaterialCommunityIcons name="rocket-launch" size={40} color="#4A90E2" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Start Study Session?</Text>
            {/* Hiển thị subject và thời gian */}
            <Text style={{ fontSize: 16, color: '#4A90E2', fontWeight: 'bold', marginBottom: 4 }}>
              Subject: {showCustomInput && customSubject.trim() !== "" ? customSubject : selectedSubject.name}
            </Text>
            <Text style={{ fontSize: 15, color: '#333', marginBottom: 16 }}>
              Duration: {formatHourMinute(hours * 60 + minutes)}
            </Text>
            <Text style={{ fontSize: 15, color: '#666', marginBottom: 20, textAlign: 'center' }}>
              Are you sure you want to start this study session?
            </Text>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: '#e0e0e0', flex: 1, marginRight: 8 }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.startButton, { flex: 1, marginLeft: 8 }]}
                onPress={async () => {
                  setShowConfirmModal(false);
                  setIsLoading(true);
                  await handleStartSession();
                  setIsLoading(false);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FF",
  },
  header: {
    backgroundColor: "#4A90E2",
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3748",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  subjectScroll: {
    marginBottom: 8,
  },
  subjectContainer: {
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  subjectItem: {
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 100,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  selectedSubject: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#4A90E2",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    backgroundColor: "#F7FAFC",
  },
  subjectText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#718096",
    textAlign: "center",
    flexShrink: 1,
  },

  // Add Custom Subject Button Styles
  addCustomButton: {
    borderStyle: "dashed",
    borderColor: "#CBD5E0",
  },
  addCustomIcon: {
    backgroundColor: "#F7FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  addCustomText: {
    color: "#A0AEC0",
    fontSize: 9,
  },

  // Custom Subject Input Styles
  customSubjectContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F8F9FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  customSubjectLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  customSubjectInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
    color: "#2D3748",
  },
  customSubjectInputError: {
    borderColor: "#FF6B6B",
  },
  customSubjectError: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
  },

  // Improved Time Picker Styles
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  timeSelector: {
    alignItems: "center",
    flex: 1,
  },
  timeSeparator: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 15,
    marginTop: 35,
  },
  colonText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  timeSelectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 15,
  },
  timeInputContainer: {
    alignItems: "center",
    backgroundColor: "#F8F9FF",
    borderRadius: 20,
    padding: 8,
    minWidth: 110,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  timeButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 15,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  topButton: {
    marginBottom: 8,
  },
  bottomButton: {
    marginTop: 8,
  },
  timeValueContainer: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: "#4A90E2",
    minWidth: 90,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A90E2",
    lineHeight: 30,
  },
  timeUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: "#718096",
    marginTop: 2,
  },
  quickTimeSection: {
    marginBottom: 20,
  },
  quickTimeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#718096",
    marginBottom: 8,
  },
  quickTimeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickTimeButton: {
    backgroundColor: "#F8F9FF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: "22%",
    alignItems: "center",
  },
  quickTimeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A90E2",
  },
  totalTimeContainer: {
    backgroundColor: "#F8F9FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  totalTimeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A90E2",
    marginLeft: 8,
  },

  cameraSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cameraInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cameraIconContainer: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  cameraText: {
    flex: 1,
  },
  cameraTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
  },
  cameraDescription: {
    fontSize: 14,
    color: "#718096",
    marginTop: 4,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  violationContainer: {
    backgroundColor: "#FFF",
  },
  violationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF8F8",
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  violationIcon: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  violationText: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "500",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  disabledButton: {
    backgroundColor: "#CBD5E0",
    shadowOpacity: 0,
    elevation: 0,
  },
});
