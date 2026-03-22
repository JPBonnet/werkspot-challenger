import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getAppName = () => {
  if (IS_DEV) return 'Werkspot Dev';
  if (IS_PREVIEW) return 'Werkspot Preview';
  return 'Werkspot Challenger';
};

const getBundleId = () => {
  if (IS_DEV) return 'com.werkspot.challenger.dev';
  if (IS_PREVIEW) return 'com.werkspot.challenger.preview';
  return 'com.werkspot.challenger';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'werkspot-challenger',
  version: process.env.APP_VERSION || '0.1.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#1A3A52',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: getBundleId(),
    buildNumber: process.env.BUILD_NUMBER || '1',
    infoPlist: {
      NSCameraUsageDescription: 'Upload photos of jobs or your profile',
      NSPhotoLibraryUsageDescription: 'Select photos for your profile or job details',
      NSLocationWhenInUseUsageDescription: 'Find professionals near you',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#1A3A52',
    },
    package: getBundleId(),
    versionCode: parseInt(process.env.BUILD_NUMBER || '1', 10),
    permissions: [
      'android.permission.CAMERA',
      'android.permission.INTERNET',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-stripe-sdk',
      {
        merchantIdentifier: 'merchant.com.werkspot',
      },
    ],
  ],
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.werkspot-challenger.com',
    stripeKey: process.env.EXPO_PUBLIC_STRIPE_KEY,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || 'REPLACE_WITH_PROJECT_ID',
    },
  },
  owner: 'jpbonnet',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/REPLACE_WITH_PROJECT_ID',
  },
});
