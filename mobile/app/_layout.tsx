import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useAssignmentStore } from '../store/assignmentStore';
import { useLocationTracking } from '../hooks';
import {
  initializeOneSignal,
  addNotificationClickListener,
  addNotificationForegroundListener,
} from '../services/notifications/pushNotifications';
import { I18nProvider } from '../i18n';
import { ThemeProvider, useTheme } from '../contexts/theme-context';

function RootLayoutContent() {
  const { isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const { colors: themeColors, isDark } = useTheme();
  useLocationTracking();

  useEffect(() => {
    initializeOneSignal();

    const initialize = async () => {
      await checkAuth();
      setIsInitializing(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    const removeClickListener = addNotificationClickListener((data) => {
      if (data.type === 'assignment' && isAuthenticated) {
        useAssignmentStore.getState().refreshAssignments().catch(() => {});
      }
    });

    const removeForegroundListener = addNotificationForegroundListener((data) => {
      if (data.type === 'assignment' && isAuthenticated) {
        useAssignmentStore.getState().refreshAssignments().catch(() => {});
      }
    });

    return () => {
      removeClickListener();
      removeForegroundListener();
    };
  }, [isAuthenticated]);

  if (isInitializing || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="assignment/[id]"
          options={{
            headerShown: true,
            title: 'Assignment Details',
            headerBackTitle: 'Back',
            headerStyle: {
              backgroundColor: themeColors.background,
            },
            headerTintColor: themeColors.text.primary,
            headerTitleStyle: {
              color: themeColors.text.primary,
            },
            contentStyle: {
              backgroundColor: themeColors.background,
            },
            statusBarStyle: isDark ? 'light' : 'dark',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
