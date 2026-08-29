import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '../ui/Card';
import { colors, spacing } from '../../utils/constants';

interface AssignmentSkeletonCardProps {
  compact?: boolean;
}

export const AssignmentSkeletonCard: React.FC<AssignmentSkeletonCardProps> = ({ compact = false }) => {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  return (
    <Animated.View style={{ opacity: pulse }}>
      <Card style={StyleSheet.flatten([styles.card, compact ? styles.compactCard : undefined])} elevation="md">
        <View style={styles.header}>
          <View style={styles.titleLine} />
          <View style={styles.badgeLine} />
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaLine} />
        </View>
        <View style={styles.locationBlock}>
          <View style={styles.locationLine} />
          <View style={styles.locationLineSmall} />
        </View>
        {!compact && (
          <View style={styles.footerRow}>
            <View style={styles.buttonLine} />
            <View style={styles.buttonLineWide} />
          </View>
        )}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.18)',
  },
  compactCard: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleLine: {
    width: '45%',
    height: 14,
    borderRadius: 8,
    backgroundColor: `${colors.primary}1A`,
  },
  badgeLine: {
    width: 70,
    height: 18,
    borderRadius: 10,
    backgroundColor: `${colors.primaryLight}1F`,
  },
  metaRow: {
    marginBottom: spacing.md,
  },
  metaLine: {
    width: '30%',
    height: 10,
    borderRadius: 6,
    backgroundColor: `${colors.primary}14`,
  },
  locationBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  locationLine: {
    width: '70%',
    height: 10,
    borderRadius: 6,
    backgroundColor: `${colors.primary}12`,
  },
  locationLineSmall: {
    width: '55%',
    height: 10,
    borderRadius: 6,
    backgroundColor: `${colors.primary}0F`,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  buttonLine: {
    width: 80,
    height: 30,
    borderRadius: 16,
    backgroundColor: `${colors.primary}12`,
  },
  buttonLineWide: {
    width: 100,
    height: 30,
    borderRadius: 16,
    backgroundColor: `${colors.primary}1A`,
  },
});
