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
import { useTheme } from '../../contexts/ThemeContext';
import { useCameraPermissions } from 'expo-camera';

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
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [cameraAI, setCameraAI] = useState(false); // Mặc định là false
  const [permission, requestPermission] = useCameraPermissions();
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [customSubject, setCustomSubject] = useState("");
  const [customSubjectError, setCustomSubjectError] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const { createSession } = useSessionStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSession = async () => {
    // Kiểm tra nếu đã có session active thì không cho tạo mới
    const existingSession = await AsyncStorage.getItem("CURRENT_STUDY_SESSION");
    if (existingSession) {
      alert("Bạn đang có phiên học chưa kết thúc. Hãy hoàn thành hoặc kết thúc phiên đó trước khi tạo phiên mới.");
      return;
    }
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
        aiEnabled: cameraAI, // truyền đúng trạng thái
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
          aiEnabled: cameraAI, // Lưu trạng thái AI camera
        };
        await AsyncStorage.setItem(
          "CURRENT_STUDY_SESSION",
          JSON.stringify(sessionData)
        );
        console.log('DEBUG: cameraAI', cameraAI);
        console.log('DEBUG: router.push params', {
          duration: totalMinutes.toString(),
          subject: sessionData.subject,
          sessionKey,
          sessionId,
          isNewSession: 'true',
          aiEnabled: cameraAI.toString(),
        });
        router.push({
          pathname: "/(user)/StudySession",
          params: {
            duration: totalMinutes.toString(),
            subject: sessionData.subject,
            sessionKey,
            sessionId,
            isNewSession: 'true',
            aiEnabled: cameraAI.toString(),
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
            <MaterialCommunityIcons name="close" size={26} color={theme.colors.onPrimary} />
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
                color={theme.colors.primary}
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
                            backgroundColor: subject.color + '20',
                          },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={subject.icon as any}
                        size={24}
                        color={
                          selectedSubject.id === subject.id && !showCustomInput
                            ? subject.color
                            : theme.colors.textMuted
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
                      showCustomInput && { backgroundColor: theme.colors.primary + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color={showCustomInput ? theme.colors.primary : theme.colors.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.subjectText,
                      styles.addCustomText,
                      showCustomInput && {
                        color: theme.colors.primary,
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
                  placeholderTextColor={theme.colors.placeholder}
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
                color={theme.colors.primary}
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
                      color={theme.colors.onPrimary}
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
                      color={theme.colors.onPrimary}
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
                      color={theme.colors.onPrimary}
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
                      color={theme.colors.onPrimary}
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
              <MaterialCommunityIcons name="timer" size={20} color={theme.colors.primary} />
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
                    color={theme.colors.primary}
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
                onValueChange={async (value) => {
                  if (value) {
                    // Nếu bật, kiểm tra quyền
                    if (!permission || !permission.granted) {
                      const perm = await requestPermission();
                      if (perm.granted) {
                        setCameraAI(true);
                      } else {
                        setCameraAI(false);
                        setShowCameraModal(true);
                      }
                    } else {
                      setCameraAI(true);
                    }
                  } else {
                    setCameraAI(false);
                  }
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.surface}
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
                color={theme.colors.error}
              />{" "}
              Penalty Rules
            </Text>
            <View style={styles.violationContainer}>
              <View style={styles.violationItem}>
                <View style={styles.violationIcon}>
                  <MaterialCommunityIcons
                    name="exit-to-app"
                    size={20}
                    color={theme.colors.error}
                  />
                </View>
                <Text style={styles.violationText}>Exit app: -100 points</Text>
              </View>
              <View style={styles.violationItem}>
                <View style={styles.violationIcon}>
                  <MaterialCommunityIcons
                    name="eye-off"
                    size={20}
                    color={theme.colors.warning}
                  />
                </View>
                <Text style={styles.violationText}>Lose focus: -50 points</Text>
              </View>
              <View style={styles.violationItem}>
                <View style={styles.violationIcon}>
                  <MaterialCommunityIcons
                    name="cellphone"
                    size={20}
                    color={theme.colors.error}
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
            color={theme.colors.onPrimary}
            style={styles.buttonIcon}
          />
          <Text style={styles.startButtonText}>
            {isLoading ? "Loading..." : "Start Study Session"}
          </Text>
          {isLoading && <ActivityIndicator size="small" color={theme.colors.onPrimary} style={{ marginLeft: 8 }} />}
        </TouchableOpacity>
      </View>
      {/* Modal xác nhận bắt đầu học */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay }}>
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 16, padding: 24, alignItems: 'center', width: 300 }}>
            <MaterialCommunityIcons name="rocket-launch" size={40} color={theme.colors.primary} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme.colors.text }}>Start Study Session?</Text>
            {/* Hiển thị subject và thời gian */}
            <Text style={{ fontSize: 16, color: theme.colors.primary, fontWeight: 'bold', marginBottom: 4 }}>
              Subject: {showCustomInput && customSubject.trim() !== "" ? customSubject : selectedSubject.name}
            </Text>
            <Text style={{ fontSize: 15, color: theme.colors.text, marginBottom: 16 }}>
              Duration: {formatHourMinute(hours * 60 + minutes)}
            </Text>
            <Text style={{ fontSize: 15, color: theme.colors.textSecondary, marginBottom: 20, textAlign: 'center' }}>
              Are you sure you want to start this study session?
            </Text>
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: theme.colors.surfaceVariant, flex: 1, marginRight: 8 }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={{ color: theme.colors.text, fontWeight: 'bold' }}>Cancel</Text>
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
                <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal thông báo quyền camera */}
      <Modal visible={showCameraModal} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.overlay }}>
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 16, padding: 24, alignItems: 'center', width: 300 }}>
            <MaterialCommunityIcons name="camera-off" size={40} color={theme.colors.error} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: theme.colors.error, textAlign: 'center' }}>Camera Permission Required</Text>
            <Text style={{ fontSize: 15, color: theme.colors.text, marginBottom: 16, textAlign: 'center' }}>
              You must grant camera permission to enable AI Camera Monitor. Please allow camera access in your device settings.
            </Text>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.colors.primary, width: '100%' }]}
              onPress={() => setShowCameraModal(false)}
            >
              <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold', textAlign: 'center' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: theme.colors.primary,
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
    backgroundColor: theme.colors.onPrimary + '20',
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
    color: theme.colors.onPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onPrimary + 'CC',
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: theme.colors.onPrimary + '20',
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
    color: theme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
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
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.outline,
  },
  selectedSubject: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
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
    backgroundColor: theme.colors.surfaceVariant,
  },
  subjectText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    textAlign: "center",
    flexShrink: 1,
  },

  // Add Custom Subject Button Styles
  addCustomButton: {
    borderStyle: "dashed",
    borderColor: theme.colors.outline,
  },
  addCustomIcon: {
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 2,
    borderColor: theme.colors.outline,
    borderStyle: "dashed",
  },
  addCustomText: {
    color: theme.colors.textMuted,
    fontSize: 9,
  },

  // Custom Subject Input Styles
  customSubjectContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  customSubjectLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  customSubjectInput: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
  },
  customSubjectInputError: {
    borderColor: theme.colors.error,
  },
  customSubjectError: {
    color: theme.colors.error,
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
    color: theme.colors.primary,
  },
  timeSelectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 15,
  },
  timeInputContainer: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 8,
    minWidth: 110,
    borderWidth: 2,
    borderColor: theme.colors.outline,
  },
  timeButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
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
    backgroundColor: theme.colors.card,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    minWidth: 90,
    alignItems: "center",
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
    lineHeight: 30,
  },
  timeUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  quickTimeSection: {
    marginBottom: 20,
  },
  quickTimeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  quickTimeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickTimeButton: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    minWidth: "22%",
    alignItems: "center",
  },
  quickTimeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  totalTimeContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  totalTimeText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.primary + '20',
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
    color: theme.colors.text,
  },
  cameraDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  violationContainer: {
    backgroundColor: theme.colors.card,
  },
  violationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.error + '08',
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  violationIcon: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  violationText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.onPrimary,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  disabledButton: {
    backgroundColor: theme.colors.outline,
    shadowOpacity: 0,
    elevation: 0,
  },
});
