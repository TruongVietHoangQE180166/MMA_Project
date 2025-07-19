import React, { useRef, useState } from 'react';
import { View, Text, Image, StatusBar, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const isSmallDevice = width < 375 || height < 667;

const slides = [
  {
    key: '1',
    title: 'Welcome to Study Agent',
    subtitle: 'Your Personal Learning Companion',
    description: 'Transform your learning experience with AI-powered study tools designed to help you achieve your academic goals.',
    image: require('../assets/images/onboard1.png'),
    gradient: ['#667eea', '#764ba2'],
  },
  {
    key: '2',
    title: 'Track Your Progress',
    subtitle: 'Stay Motivated & Organized',
    description: 'Monitor your learning journey with detailed analytics, performance insights, and personalized study recommendations.',
    image: require('../assets/images/onboard2.png'),
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    key: '3',
    title: 'AI-Powered Learning',
    subtitle: 'Smart Study Assistant',
    description: 'Get instant answers, explanations, and study guidance from our advanced AI that adapts to your learning style.',
    image: require('../assets/images/onboard3.png'),
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    key: '4',
    title: 'Ready to Excel?',
    subtitle: 'Let\'s Begin Your Journey',
    description: 'Join thousands of students who have already improved their academic performance with Study Agent.',
    image: require('../assets/images/onboard4.png'),
    gradient: ['#43e97b', '#38f9d7'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const sliderRef = useRef<AppIntroSlider>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDone = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      sliderRef.current?.goToSlide(currentIndex + 1);
      setCurrentIndex(currentIndex + 1); // Đảm bảo cập nhật state ngay khi bấm Next
    } else {
      handleDone();
    }
  };

  const handleSkip = () => {
    handleDone();
  };

  const onSlideChange = (index: number) => {
    setCurrentIndex(index);
  };

  const renderItem = ({ item, index }: { item: typeof slides[0], index: number }) => (
    <View style={styles.slide}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor={Platform.OS === 'android' ? theme.colors.background : "transparent"} 
        translucent={Platform.OS === 'ios'} 
      />
      
      {/* Main Content Container */}
      <View style={[
        styles.contentContainer,
        {
          paddingTop: Platform.OS === 'ios' 
            ? Math.max(insets.top + 15, 35)
            : Math.max(insets.top + 5, 25),
        }
      ]}>
        
        {/* 1. Image Section - Increased height */}
        <View style={styles.imageSection}>
          <Image 
            source={item.image} 
            style={styles.image}
            resizeMode="contain" 
          />
          
          {/* Decorative Elements */}
          <View style={[
            styles.decorativeCircle, 
            styles.circle1, 
            { backgroundColor: theme.colors.primary + '15' }
          ]} />
          <View style={[
            styles.decorativeCircle, 
            styles.circle2, 
            { backgroundColor: theme.colors.primary + '10' }
          ]} />
        </View>

        {/* 2. Step Indicator */}
        <View style={styles.stepSection}>
          <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
              STEP {index + 1} OF 4
            </Text>
          </View>
        </View>
        
        {/* 3. Text Section - Increased height */}
        <View style={styles.textSection}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
            {item.subtitle}
          </Text>
          
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
        
      </View>
    </View>
  );

  // Render pagination dots manually
  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex 
              ? { ...styles.activeDot, backgroundColor: theme.colors.primary }
              : { ...styles.inactiveDot, backgroundColor: theme.colors.textSecondary + '30' }
          ]}
        />
      ))}
    </View>
  );

  // Render custom buttons
  const renderButtons = () => (
    <View style={[
      styles.buttonContainer,
      {
        paddingBottom: Platform.OS === 'ios' 
          ? Math.max(insets.bottom + 20, 40)
          : Math.max(insets.bottom + 10, 30),
      }
    ]}>
      {currentIndex < slides.length - 1 ? (
        // Show Skip and Next buttons
        <View style={styles.buttonsRow}>
          <TouchableOpacity 
            style={[styles.skipButton, { 
              borderColor: theme.colors.textSecondary + '30',
            }]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
              Skip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            }]}
            onPress={handleNext}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Show Get Started button (centered)
        <View style={[styles.buttonsRow, { justifyContent: 'center' }]}>
          <TouchableOpacity 
            style={[styles.doneButton, { 
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            }]}
            onPress={handleDone}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.surface }]}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppIntroSlider
        ref={sliderRef}
        data={slides}
        renderItem={renderItem}
        onSlideChange={onSlideChange}
        showSkipButton={false}
        showNextButton={false}
        showDoneButton={false}
        dotClickEnabled={false}
        renderPagination={() => null}
      />
      
      {/* Custom Pagination */}
      {renderPaginationDots()}
      
      {/* Custom Buttons */}
      {renderButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-evenly', // Căn đều các thành phần theo chiều dọc
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  
  // 1. Image Section - Significantly increased height
  imageSection: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 0, // Giảm margin để không dư thừa
  },
  image: {
    width: isTablet ? 360 : isSmallDevice ? 270 : 320, // Tăng kích thước ảnh lớn hơn nữa
    height: isTablet ? 360 : isSmallDevice ? 270 : 320, // Tăng kích thước ảnh lớn hơn nữa
    resizeMode: 'contain',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 100,
  },
  circle1: {
    width: isTablet ? 120 : isSmallDevice ? 90 : 105, // Tăng kích thước circle theo ảnh
    height: isTablet ? 120 : isSmallDevice ? 90 : 105,
    top: -20,
    right: 20,
    opacity: 0.6,
  },
  circle2: {
    width: isTablet ? 90 : isSmallDevice ? 70 : 80, // Tăng kích thước circle theo ảnh
    height: isTablet ? 90 : isSmallDevice ? 70 : 80,
    bottom: -15,
    left: 20,
    opacity: 0.4,
  },
  
  // 2. Step Section - Increased size
  stepSection: {
    alignItems: 'center',
    marginBottom: 0, // Giảm margin để không dư thừa
  },
  badge: {
    paddingHorizontal: 24, // Tăng từ 20 lên 24
    paddingVertical: 10, // Tăng từ 8 lên 10
    borderRadius: 28, // Tăng từ 25 lên 28
  },
  badgeText: {
    fontSize: isTablet ? 16 : isSmallDevice ? 13 : 15, // Tăng font size thêm
    fontWeight: '700', // Tăng font weight
    letterSpacing: 1.0, // Tăng letter spacing
  },
  
  // 3. Text Section - Significantly increased height
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 0, // Giảm margin để không dư thừa
  },
  title: {
    fontSize: isTablet ? 34 : isSmallDevice ? 26 : 30, // Tăng font size thêm
    fontWeight: '800', // Tăng font weight
    textAlign: 'center',
    marginBottom: 12, // Tăng từ 10 lên 12
    letterSpacing: 0.5, // Tăng letter spacing
  },
  subtitle: {
    fontSize: isTablet ? 20 : isSmallDevice ? 16 : 18, // Tăng font size thêm
    fontWeight: '700', // Tăng font weight
    textAlign: 'center',
    marginBottom: 16, // Tăng từ 14 lên 16
    fontStyle: 'italic',
  },
  description: {
    fontSize: isTablet ? 19 : isSmallDevice ? 16 : 18, // Tăng font size thêm
    textAlign: 'center',
    lineHeight: isTablet ? 28 : isSmallDevice ? 24 : 26, // Tăng line height thêm
    paddingHorizontal: 8,
    fontWeight: '400',
  },
  
  // Custom Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8, // Giảm từ 10 xuống 8
    marginBottom: 8, // Giảm từ 10 xuống 8
  },
  dot: {
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 32,
    height: 8,
  },
  inactiveDot: {
    width: 8,
    height: 8,
  },
  
  // Custom Buttons Container
  buttonContainer: {
    paddingHorizontal: 24,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  
  // Button Styles
  actionButton: {
    paddingVertical: isTablet ? 16 : isSmallDevice ? 12 : 14,
    paddingHorizontal: isTablet ? 70 : isSmallDevice ? 55 : 60,
    borderRadius: 25,
    minWidth: isTablet ? 200 : isSmallDevice ? 160 : 180,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'android' ? 0.2 : 0.3,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 8 : 6,
  },
  actionButtonText: {
    fontSize: isTablet ? 16 : isSmallDevice ? 14 : 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: isTablet ? 16 : isSmallDevice ? 12 : 14,
    paddingHorizontal: isTablet ? 70 : isSmallDevice ? 55 : 60,
    borderRadius: 25,
    minWidth: isTablet ? 200 : isSmallDevice ? 160 : 180,
    alignItems: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    fontSize: isTablet ? 16 : isSmallDevice ? 14 : 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  doneButton: {
    paddingVertical: isTablet ? 16 : isSmallDevice ? 12 : 14,
    paddingHorizontal: isTablet ? 80 : isSmallDevice ? 65 : 70,
    borderRadius: 25,
    minWidth: isTablet ? 260 : isSmallDevice ? 220 : 240,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'android' ? 0.2 : 0.3,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 8 : 6,
    alignSelf: 'center',
  },
});