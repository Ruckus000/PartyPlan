// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    __esModule: true,
    default: ({ children, ...props }) => <View {...props}>{children}</View>,
    Svg: ({ children, ...props }) => <View {...props}>{children}</View>,
    Path: (props) => <View {...props} />,
    Circle: (props) => <View {...props} />,
    Line: (props) => <View {...props} />,
    Polyline: (props) => <View {...props} />,
    Rect: (props) => <View {...props} />,
    Polygon: (props) => <View {...props} />,
    G: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

// Mock LayoutAnimation
jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation');

// Mock Expo winter runtime to fix import scope errors
jest.mock('expo/src/winter/runtime.native', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('expo/src/winter/installGlobal', () => ({
  __esModule: true,
  default: {},
}));

// Mock the Expo import.meta registry
global.__ExpoImportMetaRegistry = {
  get: jest.fn(),
  set: jest.fn(),
};

// Polyfill for structuredClone (not available in Jest environment)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => {
    // Simple deep clone implementation for testing
    return JSON.parse(JSON.stringify(obj));
  };
}

// Mock console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
