import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from '../../components/dashboard/StatCard';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/authStore';
import { colors, typography, spacing } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const { 
    stats, 
    recentActivity, 
    pendingCount, 
    isLoading, 
    isRefreshing, 
    error,
    refresh 
  } = useDashboard();

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleViewAssignments = () => {
    router.push('/(tabs)/assignments');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Rider'}</Text>
        </View>
        <Button
          title=""
          onPress={handleLogout}
          variant="ghost"
          icon={<Ionicons name="log-out-outline" size={24} color={colors.text.secondary} />}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Pending Assignments Alert */}
        {pendingCount > 0 && (
          <Card style={styles.alertCard} onPress={handleViewAssignments}>
            <View style={styles.alertContent}>
              <View style={styles.alertIconContainer}>
                <Ionicons name="notifications" size={20} color={colors.warning} />
              </View>
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>
                  {pendingCount} Pending {pendingCount === 1 ? 'Assignment' : 'Assignments'}
                </Text>
                <Text style={styles.alertSubtitle}>Tap to view and accept</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </View>
          </Card>
        )}

        {/* Stats Section */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Deliveries"
            value={stats?.todayDeliveries ?? 0}
            icon="bicycle"
            iconColor={colors.primary}
          />
          <StatCard
            title="Pending"
            value={stats?.pendingAssignments ?? pendingCount}
            icon="time"
            iconColor={colors.warning}
          />
          <StatCard
            title="Completed"
            value={stats?.completedToday ?? 0}
            icon="checkmark-circle"
            iconColor={colors.success}
          />
          <StatCard
            title="Earnings"
            value={formatCurrency(stats?.totalEarnings ?? 0)}
            icon="cash"
            iconColor={colors.success}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Card style={styles.actionCard} onPress={handleViewAssignments}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="list" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionText}>View Assignments</Text>
          </Card>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <RecentActivity 
          activities={recentActivity || []} 
          onActivityPress={(activity) => {
            if (activity.assignmentId) {
              router.push(`/assignment/${activity.assignmentId}`);
            }
          }}
        />

        {/* Error Display */}
        {error && (
          <Card style={styles.errorCard}>
            <Ionicons name="alert-circle" size={24} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              onPress={handleRefresh}
              variant="outline"
              size="small"
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  alertSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: colors.text.primary,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.danger,
  },
});
