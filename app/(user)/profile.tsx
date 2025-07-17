import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { AuthButton } from "../../components/AuthButton";
import { useAuthStore } from "../../store/authStore";

export default function UserProfile() {
  const {
    user,
    userProfile,
    logout,
    updateProfile,
    updateProfileWithImage,
    getUserProfile,
  } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    nickName: userProfile?.nickName || "",
    fullName: userProfile?.fullName || "",
    phoneNumber: userProfile?.phoneNumber || "",
    dateOfBirth: userProfile?.dateOfBirth || "",
    gender: userProfile?.gender || "MALE",
    avatar: userProfile?.avatar || "",
  });
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Not updated";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format date for API (ISO string)
  const formatDateForAPI = (date: Date) => {
    return date.toISOString();
  };

  // Parse date from API response
  const parseDateFromAPI = (dateString: string) => {
    if (!dateString) return new Date();
    try {
      return new Date(dateString);
    } catch {
      return new Date();
    }
  };

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/");
          } catch (error) {
            console.error("Logout failed:", error);
            Alert.alert("Error", "Logout failed. Please try again.");
          }
        },
      },
    ]);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile({
        nickName: userProfile?.nickName || "",
        fullName: userProfile?.fullName || "",
        phoneNumber: userProfile?.phoneNumber || "",
        dateOfBirth: userProfile?.dateOfBirth || "",
        gender: userProfile?.gender || "MALE",
        avatar: userProfile?.avatar || "",
      });
      setSelectedImage(null);
    }
    setIsEditing(!isEditing);
  };

  const handleImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to change avatar."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageAsset = result.assets[0];
        const imageFile = {
          uri: imageAsset.uri,
          type: imageAsset.mimeType || "image/jpeg",
          name: imageAsset.fileName || `avatar_${Date.now()}.jpg`,
        };
        setSelectedImage(imageFile);
        setEditedProfile({
          ...editedProfile,
          avatar: imageAsset.uri,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // Handle date picker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === "ios");
    setSelectedDate(currentDate);
    setEditedProfile({
      ...editedProfile,
      dateOfBirth: formatDateForAPI(currentDate),
    });
  };

  const showDatePickerModal = () => {
    // Set initial date from current profile
    if (editedProfile.dateOfBirth) {
      setSelectedDate(parseDateFromAPI(editedProfile.dateOfBirth));
    }
    setShowDatePicker(true);
  };

  useFocusEffect(
    useCallback(() => {
      const refreshProfile = async () => {
        try {
          await getUserProfile(true);
        } catch (error) {
          // Handle error silently
        }
      };

      refreshProfile();
    }, [getUserProfile])
  );

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const { avatar, ...profileDataWithoutAvatar } = editedProfile;

      let updatedProfile;

      if (selectedImage) {
        updatedProfile = await updateProfileWithImage(
          profileDataWithoutAvatar,
          selectedImage
        );
      } else {
        updatedProfile = await updateProfile(profileDataWithoutAvatar);
      }

      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
      setSelectedImage(null);
      setEditedProfile({
        nickName: updatedProfile?.nickName || "",
        fullName: updatedProfile?.fullName || "",
        phoneNumber: updatedProfile?.phoneNumber || "",
        dateOfBirth: updatedProfile?.dateOfBirth || "",
        gender: updatedProfile?.gender || "MALE",
        avatar: updatedProfile?.avatar || "",
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: 48, paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header với logo */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>Study-Agent</Text>
            <Text style={styles.subtitle}>Loading information...</Text>
          </View>
          <View style={styles.section}>
            <AuthButton title="Logout" onPress={handleLogout} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 48, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header với logo */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.title}>Study-Agent</Text>
          <Text style={styles.subtitle}>View and edit your profile</Text>
          <View style={styles.avatarContainer}>
            {(isEditing ? editedProfile.avatar : userProfile.avatar) ? (
              <Image
                source={{
                  uri: isEditing ? editedProfile.avatar : userProfile.avatar,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={55} color="#9CA3AF" />
              </View>
            )}
            {isEditing && (
              <TouchableOpacity
                style={styles.editIcon}
                onPress={handleImagePicker}
              >
                <MaterialIcons name="camera-alt" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.name}>{user?.username}</Text>
          <View style={styles.badge}>
            <MaterialIcons name="email" size={16} color="#fff" />
            <Text style={styles.badgeText}>{user?.email}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            {!isEditing ? (
              <TouchableOpacity
                onPress={handleEditToggle}
                style={styles.editButton}
              >
                <MaterialIcons name="edit" size={20} color="#3B82F6" />
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity
                  onPress={handleEditToggle}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveChanges}
                  style={[
                    styles.saveButton,
                    isLoading && styles.saveButtonDisabled,
                  ]}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="person-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nickname</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedProfile.nickName}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, nickName: text })
                    }
                    placeholder="Enter nickname"
                    placeholderTextColor="#666"
                    editable={!isLoading}
                  />
                ) : (
                  <Text style={styles.infoText}>
                    {userProfile.nickName || "Not updated"}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialIcons name="badge" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedProfile.fullName}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, fullName: text })
                    }
                    placeholder="Enter full name"
                    placeholderTextColor="#666"
                    editable={!isLoading}
                  />
                ) : (
                  <Text style={styles.infoText}>
                    {userProfile.fullName || "Not updated"}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.infoInput}
                    value={editedProfile.phoneNumber}
                    onChangeText={(text) =>
                      setEditedProfile({ ...editedProfile, phoneNumber: text })
                    }
                    placeholder="Enter phone number"
                    placeholderTextColor="#666"
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                ) : (
                  <Text style={styles.infoText}>
                    {userProfile.phoneNumber || "Not updated"}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialIcons name="cake" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                {isEditing ? (
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={showDatePickerModal}
                    disabled={isLoading}
                  >
                    <Text style={styles.datePickerText}>
                      {editedProfile.dateOfBirth
                        ? formatDateForDisplay(editedProfile.dateOfBirth)
                        : "Select date"}
                    </Text>
                    <MaterialIcons name="date-range" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.infoText}>
                    {formatDateForDisplay(userProfile.dateOfBirth)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialIcons name="wc" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Gender</Text>
                {isEditing ? (
                  <View style={styles.genderContainer}>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        editedProfile.gender === "MALE" &&
                          styles.genderButtonActive,
                      ]}
                      onPress={() =>
                        setEditedProfile({ ...editedProfile, gender: "MALE" })
                      }
                      disabled={isLoading}
                    >
                      <MaterialIcons
                        name="male"
                        size={16}
                        color={
                          editedProfile.gender === "MALE" ? "#fff" : "#3B82F6"
                        }
                      />
                      <Text
                        style={[
                          styles.genderText,
                          editedProfile.gender === "MALE" &&
                            styles.genderTextActive,
                        ]}
                      >
                        Male
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        editedProfile.gender === "FEMALE" &&
                          styles.genderButtonActive,
                      ]}
                      onPress={() =>
                        setEditedProfile({ ...editedProfile, gender: "FEMALE" })
                      }
                      disabled={isLoading}
                    >
                      <MaterialIcons
                        name="female"
                        size={16}
                        color={
                          editedProfile.gender === "FEMALE" ? "#fff" : "#3B82F6"
                        }
                      />
                      <Text
                        style={[
                          styles.genderText,
                          editedProfile.gender === "FEMALE" &&
                            styles.genderTextActive,
                        ]}
                      >
                        Female
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.infoText}>
                    {userProfile.gender === "MALE" ? "Male" : "Female"}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
        {/* Actions: Logout at the bottom */}
        <View style={styles.logoutButtonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutButtonContent}>
              <View style={styles.logoutButtonIcon}>
                <MaterialIcons name="logout" size={24} color="#fff" />
              </View>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Updating profile...</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 12,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3B82F6",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  section: {
    margin: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  editButton: {
    padding: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    minWidth: 60,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveText: {
    color: "#fff",
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  infoText: {
    fontSize: 16,
    color: "#1F2937",
  },
  infoInput: {
    fontSize: 16,
    color: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 4,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: "#1F2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: -16,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  genderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3B82F6",
    gap: 6,
  },
  genderButtonActive: {
    backgroundColor: "#3B82F6",
  },
  genderText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "500",
  },
  genderTextActive: {
    color: "#fff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  modalCancelText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  modalSubmitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
  },
  modalSubmitText: {
    color: "#fff",
    fontWeight: "500",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  logoutButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  logoutButtonIcon: {
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 8,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
