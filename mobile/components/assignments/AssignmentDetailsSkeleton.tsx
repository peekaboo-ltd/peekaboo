import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { colors, spacing } from '../../utils/constants';

export const AssignmentDetailsSkeleton: React.FC = () => {
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
      {[0, 1, 2].map((index) => (
        <Card key={index} style={styles.section} elevation="sm">
          <View style={styles.sectionHeader} />
          <View style={styles.row} />
          <View style={styles.rowWide} />
          <View style={styles.row} />
        </Card>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.18)',
  },
  sectionHeader: {
    height: 16,
    width: '45%',
    borderRadius: 8,
    backgroundColor: `${colors.primary}1A`,
    marginBottom: spacing.md,
  },
  row: {
    height: 10,
    width: '65%',
    borderRadius: 6,
    backgroundColor: `${colors.primary}12`,
    marginBottom: spacing.sm,
  },
  rowWide: {
    height: 10,
    width: '80%',
    borderRadius: 6,
    backgroundColor: `${colors.primary}10`,
    marginBottom: spacing.sm,
  },
});
