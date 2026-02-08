import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const { 
    stats, 
    recentActivity, 
    pendingCount, 
    isLoading, 
    isRefreshing, 
    error,
    refresh 
  } = useDashboard();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(activityAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activityAnim, headerAnim, heroAnim, statsAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowMid} />
        <View style={styles.glowBottom} />
      </View>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.headerSurface}>
          <View style={styles.headerLeft}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>Dashboard</Text>
            </View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Rider'}</Text>
            <Text style={styles.subline}>Ready to take on today’s routes.</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statusPill}>
              <Ionicons name="pulse" size={14} color={colors.success} />
              <Text style={styles.statusText}>Shift Active</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name || 'R')[0]?.toUpperCase()}
              </Text>
            </View>
            <Button
              title=""
              onPress={handleLogout}
              variant="ghost"
              icon={<Ionicons name="log-out-outline" size={22} color={colors.text.secondary} />}
              style={styles.logoutButton}
            />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: spacing.xxl + 60 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.heroHighlight} />
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroKicker}>Today’s Focus</Text>
              <Text style={styles.heroSubtitle}>Keep momentum with active stops.</Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={styles.heroBadgeText}>
                {pendingCount} Pending
              </Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Stay on top of active deliveries</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Earnings</Text>
              <Text style={styles.heroStatValue}>
                {formatCurrency(stats?.totalEarnings ?? 0)}
              </Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Completed</Text>
              <Text style={styles.heroStatValue}>
                {stats?.completedToday ?? 0}
              </Text>
            </View>
          </View>
          {pendingCount > 0 && (
            <Card style={styles.alertCard} onPress={handleViewAssignments}>
              <View style={styles.alertContent}>
                <View style={styles.alertIconContainer}>
                  <Ionicons name="notifications" size={18} color={colors.warning} />
                </View>
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>
                    {pendingCount} Pending {pendingCount === 1 ? 'Assignment' : 'Assignments'}
                  </Text>
                  <Text style={styles.alertSubtitle}>Tap to view and accept</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
              </View>
            </Card>
          )}
        </Animated.View>

        {/* Stats Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: statsAnim,
              transform: [
                {
                  translateY: statsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>Overview</Text>
              <Text style={styles.sectionTitle}>Today’s Snapshot</Text>
            </View>
            <Text style={styles.sectionHint}>Updated just now</Text>
          </View>
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
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>Shortcuts</Text>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            <Text style={styles.sectionHint}>Stay on track</Text>
          </View>
          <View style={styles.quickActions}>
            <Card style={styles.actionCard} onPress={handleViewAssignments}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="list" size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.actionText}>View Assignments</Text>
                <Text style={styles.actionSubtext}>Accept and start deliveries</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </Card>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: activityAnim,
              transform: [
                {
                  translateY: activityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>Timeline</Text>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <Text style={styles.sectionHint}>Last 7 days</Text>
          </View>
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
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowTop: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(95, 149, 152, 0.15)',
    top: -160,
    right: -120,
  },
  glowMid: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(29, 84, 109, 0.12)',
    top: 180,
    left: -120,
  },
  glowBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    bottom: -120,
    right: -80,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerSurface: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  kickerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight,
    marginRight: spacing.sm,
  },
  kicker: {
    fontSize: typography.caption.fontSize,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.text.secondary,
    fontWeight: '600',
  },
  greeting: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subline: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.disabled,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(29, 84, 109, 0.15)',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    marginTop: spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
    overflow: 'hidden',
  },
  heroHighlight: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 84, 109, 0.08)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  heroKicker: {
    fontSize: typography.caption.fontSize,
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  heroSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize,
    color: colors.text.disabled,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  heroStat: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
  },
  heroStatValue: {
    marginTop: 4,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text.primary,
  },
  heroDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(95, 149, 152, 0.2)',
    marginHorizontal: spacing.md,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 251, 235, 0.9)',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionKicker: {
    fontSize: typography.caption.fontSize,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.text.disabled,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: typography.caption.fontSize,
    color: colors.text.disabled,
  },
  section: {
    marginTop: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.xs, // Negative margin to offset card margins
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
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
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionSubtext: {
    marginTop: 2,
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
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
