import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Link, Stack } from 'expo-router';
import { colors, typography, spacing } from '../utils/constants';
import { useI18n } from '../i18n';

export default function NotFoundScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const { t } = useI18n();
  return (
    <>
      <Stack.Screen options={{ title: t('common.notFound') }} />
      <View style={[styles.container, isCompact && styles.containerCompact]}>
        <Text style={[styles.title, isCompact && styles.titleCompact]}>{t('notFound.title')}</Text>
        <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]}>
          {t('notFound.subtitle')}
        </Text>
        <Link href="/(tabs)/dashboard" style={styles.link}>
          <Text style={styles.linkText}>{t('notFound.goDashboard')}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  containerCompact: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  titleCompact: {
    fontSize: typography.h3.fontSize,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  subtitleCompact: {
    fontSize: typography.bodySmall.fontSize,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: typography.body.fontSize,
    color: colors.primary,
    fontWeight: '500',
  },
});
