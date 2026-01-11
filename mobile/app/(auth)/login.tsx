import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, typography } from '../../utils/constants';
import { getPasswordError, getUsernameError } from '../../utils/validators';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { login, isLoading, error, clearError } = useAuth();

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
      Alert.alert('Login Failed', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="bicycle" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Peekaboo Rider</Text>
            <Text style={styles.subtitle}>Sign in to manage your assignments</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Input
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError(null);
              }}
              label="Username or Email"
              placeholder="Enter your username or email"
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
              label="Password"
              placeholder="Enter your password"
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
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Having trouble signing in?
            </Text>
            <Text style={styles.footerLink}>
              Contact support
            </Text>
          </View>
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
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
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
  footerText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  footerLink: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary,
    fontWeight: '500',
  },
});
