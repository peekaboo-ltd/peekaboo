import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AssignmentCard } from '../../components/assignments/AssignmentCard';
import { AssignmentSkeletonCard } from '../../components/assignments/AssignmentSkeletonCard';
import { AssignmentFilters } from '../../components/assignments/AssignmentFilters';
import { Button } from '../../components/ui/Button';
import { useAssignments } from '../../hooks/useAssignments';
import { Assignment, OrderAssignmentStatus, OrderStatus } from '../../types';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useI18n } from '../../i18n';
import { colors, typography, spacing } from '../../utils/constants';

export default function AssignmentsScreen() {
  const { t } = useI18n();
  const params = useLocalSearchParams<{ filter?: string }>();
  const {
    assignments,
    isLoading,
    isRefreshing,
    error,
    filter,
    hasMore,
    setFilter,
    acceptAssignment,
    rejectAssignment,
    refreshAssignments,
    loadMore,
  } = useAssignments();
  const { confirmOrderDispatch } = useAssignmentStore();
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (params.filter) {
      setFilter(params.filter as any);
    }
  }, [params.filter, setFilter]);

  const handleRefresh = useCallback(() => {
    refreshAssignments();
  }, [refreshAssignments]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  const handleAssignmentPress = (assignment: Assignment) => {
    router.push(`/assignment/${assignment.id}`);
  };

  const handleAccept = async (id: string) => {
    const success = await acceptAssignment(id);
    if (!success) {
      const message = useAssignmentStore.getState().error || t('assignments.acceptFailed');
      Alert.alert(t('common.error'), message);
    }
  };

  const handleReject = async (id: string) => {
    const success = await rejectAssignment(id);
    if (!success) {
      const message = useAssignmentStore.getState().error || t('assignments.rejectFailed');
      Alert.alert(t('common.error'), message);
    }
  };

  const getLatestOrderStatus = (assignment: Assignment) => {
    const activities = assignment.order?.activities || [];
    if (activities.length === 0) {
      return assignment.order?.status;
    }

    const sorted = [...activities].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return sorted[0]?.status || assignment.order?.status;
  };

  const orderStatusSortRank = (status: OrderStatus | undefined): number => {
    if (!status) return 99;
    switch (status) {
      case OrderStatus.IN_TRANSIT:
      case OrderStatus.DELIVERED:
        return 0;
      case OrderStatus.PAID:
      case OrderStatus.CONFIRMED:
      case OrderStatus.ACCEPTED:
      case OrderStatus.ACTIVE:
        return 1;
      case OrderStatus.COMPLETED:
        return 2;
      default:
        return 3;
    }
  };

  const sortedAssignments = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const rankA = orderStatusSortRank(getLatestOrderStatus(a));
      const rankB = orderStatusSortRank(getLatestOrderStatus(b));
      return rankA - rankB;
    });
  }, [assignments]);

  const handleConfirmAndTransit = (assignment: Assignment) => {
    if (!assignment?.orderId) return;

    Alert.alert(
      t('assignments.confirmTransit'),
      t('assignments.confirmTransitMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('assignments.confirmTransit'),
          onPress: async () => {
            const orderId = assignment.orderId;
            setConfirmingOrderId(orderId);
            try {
              const success = await confirmOrderDispatch(orderId);
              if (success) {
                await refreshAssignments();
                Alert.alert(t('common.success'), t('assignments.transitSuccess'));
              } else {
                const message = useAssignmentStore.getState().error || t('assignments.transitFailed');
                Alert.alert(t('common.error'), message);
              }
            } finally {
              setConfirmingOrderId(null);
            }
          },
        },
      ],
    );
  };

  const renderAssignment = ({ item }: { item: Assignment }) => {
    const latestOrderStatus = getLatestOrderStatus(item);
    const canConfirmAndTransit =
      !!item.orderId &&
      item.status === OrderAssignmentStatus.ACTIVE &&
      latestOrderStatus === OrderStatus.ACCEPTED;

    return (
      <View>
        <AssignmentCard
          assignment={item}
          onPress={() => handleAssignmentPress(item)}
          onAccept={
            item.status === OrderAssignmentStatus.PENDING
              ? () => handleAccept(item.id)
              : undefined
          }
          onReject={
            item.status === OrderAssignmentStatus.PENDING
              ? () => handleReject(item.id)
              : undefined
          }
        />
        {canConfirmAndTransit && (
          <View style={styles.quickActionWrap}>
            <Button
              title={t('assignments.confirmTransit')}
              onPress={() => handleConfirmAndTransit(item)}
              variant="primary"
              fullWidth
              loading={confirmingOrderId === item.orderId}
              disabled={!!confirmingOrderId}
            />
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={colors.text.disabled} />
        <Text style={styles.emptyTitle}>{t('assignments.emptyTitle')}</Text>
        <Text style={styles.emptyText}>
          {filter === 'ALL'
            ? t('assignments.emptyAll')
            : t('assignments.emptyFiltered', { filter: filter.toLowerCase() })}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoading || isRefreshing) return null;

    return (
      <View style={styles.footer}>
        <AssignmentSkeletonCard compact />
      </View>
    );
  };

  const isInitialLoading = isLoading && assignments.length === 0;
  const summary = {
    pending: assignments.filter((assignment) => assignment.status === OrderAssignmentStatus.PENDING).length,
    active: assignments.filter((assignment) => assignment.status === OrderAssignmentStatus.ACTIVE).length,
    completed: assignments.filter((assignment) => assignment.status === OrderAssignmentStatus.COMPLETED).length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSurface}>
          <View>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>{t('assignments.title')}</Text>
            </View>
            <Text style={styles.title}>{t('assignments.queueTitle')}</Text>
            <Text style={styles.subtitle}>{t('assignments.totalAssignments', { count: assignments.length })}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryLabel}>{t('assignments.active')}</Text>
            <Text style={styles.summaryValue}>{summary.active}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t('assignments.pending')}</Text>
            <Text style={styles.summaryValue}>{summary.pending}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t('assignments.completed')}</Text>
            <Text style={styles.summaryValue}>{summary.completed}</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <AssignmentFilters
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Assignments List */}
      {isInitialLoading ? (
        <View style={styles.listContent}>
          {[0, 1, 2, 3].map((index) => (
            <AssignmentSkeletonCard key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={sortedAssignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      )}
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
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(95, 149, 152, 0.16)',
    top: -120,
    right: -80,
  },
  glowBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 84, 109, 0.12)',
    bottom: -90,
    left: -80,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerSurface: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    padding: spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 3,
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
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.16)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  summaryPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  summaryLabel: {
    fontSize: typography.caption.fontSize,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.danger,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  quickActionWrap: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
});
