import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../i18n';
import { colors, spacing, typography } from '../../utils/constants';
import { getPasswordError, getUsernameError } from '../../utils/validators';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;
  const { t } = useI18n();

  const { login, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();
  }, [footerAnim, formAnim, headerAnim]);

  const validateInputs = (): boolean => {
    const usernameErr = getUsernameError(username);
    const passErr = getPasswordError(password);

    setUsernameError(usernameErr);
    setPasswordError(passErr);

    return !usernameErr && !passErr;
  };

  const handleLogin = async () => {
    clearError();

    if (!validateInputs()) {
      return;
    }

    const success = await login({ username, password });

    if (success) {
      router.replace('/(tabs)/dashboard');
    } else if (error) {
      Alert.alert(t('auth.loginFailed'), error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowMid} />
        <View style={styles.glowBottom} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerAnim,
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>{t('auth.riderPortal')}</Text>
            </View>
            <View style={styles.languageSwitchWrap}>
              <LanguageSwitcher compact />
            </View>
            <View style={styles.logoContainer}>
              <Ionicons name="bicycle" size={40} color={colors.text.inverse} />
            </View>
            <Text style={styles.title}>{t('auth.title')}</Text>
            <Text style={styles.subtitle}>
              {t('auth.subtitle')}
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{t('auth.signIn')}</Text>
              <Text style={styles.formSubtitle}>{t('auth.formSubtitle')}</Text>
            </View>
            <Input
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError(null);
              }}
              label={t('auth.usernameOrEmail')}
              placeholder={t('auth.usernamePlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={usernameError || undefined}
              icon={<Ionicons name="person-outline" size={20} color={colors.text.secondary} />}
            />

            <Input
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(null);
              }}
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              secureTextEntry
              error={passwordError || undefined}
              icon={<Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title={t('auth.signInButton')}
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: footerAnim,
                transform: [
                  {
                    translateY: footerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.footerCard}>
              <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.footerText}>{t('auth.troubleSigningIn')}</Text>
              <Text style={styles.footerLink}>{t('auth.contactSupport')}</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(95, 149, 152, 0.18)',
    top: -120,
    right: -80,
  },
  glowMid: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 84, 109, 0.15)',
    top: 120,
    left: -90,
  },
  glowBottom: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    bottom: -120,
    right: -60,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
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
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: colors.text.secondary,
    fontWeight: '600',
  },
  languageSwitchWrap: {
    marginBottom: spacing.sm,
  },
  logoContainer: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.4,
    fontFamily: Platform.select({ ios: 'Avenir Next', android: 'serif' }),
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
    marginBottom: spacing.xl,
  },
  formHeader: {
    marginBottom: spacing.md,
  },
  formTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  formSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.bodySmall.fontSize,
    marginLeft: spacing.sm,
    flex: 1,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(29, 84, 109, 0.15)',
  },
  footerText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
});
