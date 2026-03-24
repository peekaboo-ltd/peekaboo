import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useAssignmentStore } from '../store/assignmentStore';
import { colors } from '../utils/constants';
import { useLocationTracking } from '../hooks';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '../services/notifications/pushNotifications';

export default function RootLayout() {
  const { isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  useLocationTracking();

  useEffect(() => {
    const initialize = async () => {
      await checkAuth();
      setIsInitializing(false);
    };
    initialize();
  }, []);

  useEffect(() => {
    const receivedSubscription = addNotificationReceivedListener((notification) => {
      const type = notification.request.content.data?.type;
      if (type === 'assignment' && isAuthenticated) {
        useAssignmentStore.getState().refreshAssignments().catch(() => {});
      }
    });

    const responseSubscription = addNotificationResponseListener((response) => {
      const type = response.notification.request.content.data?.type;
      if (type === 'assignment' && isAuthenticated) {
        useAssignmentStore.getState().refreshAssignments().catch(() => {});
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
