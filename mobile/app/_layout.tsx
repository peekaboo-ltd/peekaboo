import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useAssignmentStore } from '../store/assignmentStore';
import { colors } from '../utils/constants';
import { useLocationTracking } from '../hooks';
import {
  initializeOneSignal,
  addNotificationClickListener,
  addNotificationForegroundListener,
} from '../services/notifications/pushNotifications';
import { I18nProvider } from '../i18n';

function RootLayoutContent() {
  const { isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="dark" />
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
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <RootLayoutContent />
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
