import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { OrderAssignmentStatus } from '../../types';
import { useI18n } from '../../i18n';
import { colors, typography, spacing, borderRadius } from '../../utils/constants';

type FilterOption = OrderAssignmentStatus | 'ALL';

interface AssignmentFiltersProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

export const AssignmentFilters: React.FC<AssignmentFiltersProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const { t } = useI18n();
  const filters: { key: FilterOption; label: string }[] = [
    { key: 'ALL', label: t('assignments.filterAll') },
    { key: OrderAssignmentStatus.PENDING, label: t('assignments.pending') },
    { key: OrderAssignmentStatus.ACTIVE, label: t('assignments.active') },
    { key: OrderAssignmentStatus.COMPLETED, label: t('assignments.completed') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => onFilterChange(filter.key)}
              activeOpacity={0.7}
              style={[
                styles.filterButton,
                isActive && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
});
