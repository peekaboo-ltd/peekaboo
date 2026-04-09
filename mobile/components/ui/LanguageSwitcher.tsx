import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../../i18n';
import { borderRadius, spacing, typography, type AppColors } from '../../utils/constants';
import { useTheme } from '../../contexts/theme-context';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { language, setLanguage, t } = useI18n();

  return (
    <View style={styles.container}>
      {!compact && <Text style={styles.label}>{t('language.label')}</Text>}
      <View style={styles.toggleWrap}>
        <TouchableOpacity
          onPress={() => setLanguage('en')}
          style={[styles.option, language === 'en' && styles.optionActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>EN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage('rw')}
          style={[styles.option, language === 'rw' && styles.optionActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.optionText, language === 'rw' && styles.optionTextActive]}>KIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  toggleWrap: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minWidth: 44,
    alignItems: 'center',
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.text.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  optionTextActive: {
    color: colors.text.inverse,
  },
});
