import { Dimensions, Platform, StatusBar } from 'react-native';

// Device dimensions and info
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Define device types based on screen width
export const DEVICE_TYPES = {
  SMALL: 'SMALL',    // < 375px (iPhone SE, small Android)
  MEDIUM: 'MEDIUM',  // 375-414px (iPhone 6-14, standard Android)
  LARGE: 'LARGE',    // 414-768px (iPhone Plus, large Android)
  TABLET: 'TABLET',  // > 768px (iPad, Android tablets)
} as const;

// Get current device type
export const getDeviceType = (): string => {
  if (SCREEN_WIDTH < 375) return DEVICE_TYPES.SMALL;
  if (SCREEN_WIDTH < 414) return DEVICE_TYPES.MEDIUM;
  if (SCREEN_WIDTH < 768) return DEVICE_TYPES.LARGE;
  return DEVICE_TYPES.TABLET;
};

// Screen dimensions
export const SCREEN_DIMENSIONS = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_WIDTH < 375,
  isMediumDevice: SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414,
  isLargeDevice: SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768,
  isTablet: SCREEN_WIDTH >= 768,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
};

// Get status bar height
export const getStatusBarHeight = (): number => {
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 0;
  }
  // iOS status bar height varies by device
  if (SCREEN_HEIGHT >= 812) return 44; // iPhone X and newer
  return 20; // iPhone 8 and older
};

// Responsive scaling functions
export const scale = (size: number): number => {
  const baseWidth = 375; // iPhone 6/7/8 width as base
  return (SCREEN_WIDTH / baseWidth) * size;
};

export const verticalScale = (size: number): number => {
  const baseHeight = 667; // iPhone 6/7/8 height as base
  return (SCREEN_HEIGHT / baseHeight) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Responsive font sizes
export const getFontSize = (baseSize: number): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case DEVICE_TYPES.SMALL:
      return moderateScale(baseSize * 0.9);
    case DEVICE_TYPES.MEDIUM:
      return moderateScale(baseSize);
    case DEVICE_TYPES.LARGE:
      return moderateScale(baseSize * 1.1);
    case DEVICE_TYPES.TABLET:
      return moderateScale(baseSize * 1.3);
    default:
      return moderateScale(baseSize);
  }
};

// Responsive spacing
export const getSpacing = (baseSpacing: number): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case DEVICE_TYPES.SMALL:
      return scale(baseSpacing * 0.8);
    case DEVICE_TYPES.MEDIUM:
      return scale(baseSpacing);
    case DEVICE_TYPES.LARGE:
      return scale(baseSpacing * 1.1);
    case DEVICE_TYPES.TABLET:
      return scale(baseSpacing * 1.4);
    default:
      return scale(baseSpacing);
  }
};

// Responsive padding/margin
export const getPadding = (basePadding: number): number => {
  return getSpacing(basePadding);
};

export const getMargin = (baseMargin: number): number => {
  return getSpacing(baseMargin);
};

// Responsive dimensions for UI elements
export const getDimensions = (baseWidth: number, baseHeight: number) => {
  return {
    width: scale(baseWidth),
    height: verticalScale(baseHeight),
  };
};

// Responsive border radius
export const getBorderRadius = (baseRadius: number): number => {
  return moderateScale(baseRadius);
};

// Container widths for different devices
export const getContainerWidth = (percentage: number = 100): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case DEVICE_TYPES.SMALL:
      return SCREEN_WIDTH * (percentage / 100);
    case DEVICE_TYPES.MEDIUM:
      return SCREEN_WIDTH * (percentage / 100);
    case DEVICE_TYPES.LARGE:
      return SCREEN_WIDTH * (percentage / 100);
    case DEVICE_TYPES.TABLET:
      // For tablets, limit max width to prevent overly wide layouts
      return Math.min(SCREEN_WIDTH * (percentage / 100), 600);
    default:
      return SCREEN_WIDTH * (percentage / 100);
  }
};

// Form input heights
export const getInputHeight = (): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case DEVICE_TYPES.SMALL:
      return verticalScale(45);
    case DEVICE_TYPES.MEDIUM:
      return verticalScale(50);
    case DEVICE_TYPES.LARGE:
      return verticalScale(55);
    case DEVICE_TYPES.TABLET:
      return verticalScale(60);
    default:
      return verticalScale(50);
  }
};

// Button heights
export const getButtonHeight = (): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case DEVICE_TYPES.SMALL:
      return verticalScale(45);
    case DEVICE_TYPES.MEDIUM:
      return verticalScale(50);
    case DEVICE_TYPES.LARGE:
      return verticalScale(55);
    case DEVICE_TYPES.TABLET:
      return verticalScale(60);
    default:
      return verticalScale(50);
  }
};

// Icon sizes
export const getIconSize = (baseSize: number): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case DEVICE_TYPES.SMALL:
      return scale(baseSize * 0.9);
    case DEVICE_TYPES.MEDIUM:
      return scale(baseSize);
    case DEVICE_TYPES.LARGE:
      return scale(baseSize * 1.1);
    case DEVICE_TYPES.TABLET:
      return scale(baseSize * 1.3);
    default:
      return scale(baseSize);
  }
};

// Safe area calculations
export const getSafeAreaPadding = () => {
  const statusBarHeight = getStatusBarHeight();
  const deviceType = getDeviceType();
  
  let paddingTop = statusBarHeight;
  
  // Additional padding for notched devices
  if (Platform.OS === 'ios' && SCREEN_HEIGHT >= 812) {
    paddingTop += 20;
  }
  
  // Adjust for different device types
  switch (deviceType) {
    case DEVICE_TYPES.SMALL:
      paddingTop += 10;
      break;
    case DEVICE_TYPES.MEDIUM:
      paddingTop += 15;
      break;
    case DEVICE_TYPES.LARGE:
      paddingTop += 20;
      break;
    case DEVICE_TYPES.TABLET:
      paddingTop += 30;
      break;
  }
  
  return {
    paddingTop,
    paddingBottom: Platform.OS === 'ios' && SCREEN_HEIGHT >= 812 ? 34 : 0,
  };
};

// Responsive values for specific use cases
export const RESPONSIVE_VALUES = {
  // Logo sizes
  logoSize: {
    small: getDimensions(50, 50),
    medium: getDimensions(60, 60),
    large: getDimensions(70, 70),
  },
  
  // Avatar sizes
  avatarSize: {
    small: getDimensions(40, 40),
    medium: getDimensions(50, 50),
    large: getDimensions(60, 60),
  },
  
  // Form element dimensions
  formPadding: getSpacing(46),
  inputPadding: getSpacing(12),
  buttonWidth: getContainerWidth(75),
  
  // Typography
  titleFont: getFontSize(22),
  subtitleFont: getFontSize(14),
  formTitleFont: getFontSize(30),
  formSubtitleFont: getFontSize(14),
  buttonFont: getFontSize(18),
  inputFont: getFontSize(14),
  
  // Spacing
  sectionSpacing: getSpacing(30),
  elementSpacing: getSpacing(20),
  smallSpacing: getSpacing(10),
  
  // Border radius
  borderRadius: getBorderRadius(8),
  buttonRadius: getBorderRadius(8),
  inputRadius: getBorderRadius(8),
};

export default {
  SCREEN_DIMENSIONS,
  DEVICE_TYPES,
  getDeviceType,
  scale,
  verticalScale,
  moderateScale,
  getFontSize,
  getSpacing,
  getPadding,
  getMargin,
  getDimensions,
  getBorderRadius,
  getContainerWidth,
  getInputHeight,
  getButtonHeight,
  getIconSize,
  getSafeAreaPadding,
  getStatusBarHeight,
  RESPONSIVE_VALUES,
};
