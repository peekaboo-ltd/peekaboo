import type { ExpoConfig } from 'expo/config';

const BUNDLE_ID = 'com.peekaboo.rider';

/**
 * Align APNs / OneSignal plugin mode with EAS profile (see OneSignal Expo SDK setup).
 * Local `expo prebuild` / `expo start`: no EAS_BUILD_PROFILE → development.
 */
function getOneSignalMode(): 'development' | 'production' {
  const profile = process.env.EAS_BUILD_PROFILE ?? '';
  if (profile === 'development' || profile === 'development-device') {
    return 'development';
  }
  if (profile === 'preview' || profile === 'production') {
    return 'production';
  }
  return 'development';
}

export default (): ExpoConfig => {
  const oneSignalMode = getOneSignalMode();
  const appGroup = `group.${BUNDLE_ID}.onesignal`;

  return {
    name: 'Peekaboo Rider',
    slug: 'peekaboo-rider',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'peekaboo-rider',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1D546D',
      dark: {
        image: './assets/images/splash-icon-dark.png',
        resizeMode: 'contain',
        backgroundColor: '#1D546D',
      },
    },
    ios: {
      supportsTablet: false,
      icon: './assets/images/icon-ios.png',
      bundleIdentifier: BUNDLE_ID,
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
        NSLocationWhenInUseUsageDescription:
          'We need your location to show delivery routes',
        NSLocationAlwaysUsageDescription:
          'We need your location for real-time tracking during deliveries',
        ITSAppUsesNonExemptEncryption: false,
      },
      entitlements: {
        'aps-environment': oneSignalMode,
        'com.apple.security.application-groups': [appGroup],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#1D546D',
      },
      package: BUNDLE_ID,
      edgeToEdgeEnabled: true,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      [
        'onesignal-expo-plugin',
        {
          mode: oneSignalMode,
          appGroupName: appGroup,
          largeIcons: ['./assets/images/icon.png'],
          smallIcons: ['./assets/images/ic_stat_peekaboo.png'],
        },
      ],
      'expo-dev-client',
      'expo-router',
      'expo-secure-store',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow Peekaboo Rider to use your location for deliveries.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '18dd4900-07a3-4b78-aaad-ee52f242b574',
      },
    },
    owner: 'nishimweprince',
  };
};
