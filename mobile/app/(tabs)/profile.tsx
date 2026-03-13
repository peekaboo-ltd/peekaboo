import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../utils/constants';
import { usersAPI } from '../../services/api/users';
import { handleAPIError, getErrorMessage } from '../../utils/errorHandler';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const statusLabel = useMemo(() => {
    if (!user?.status) return 'Unknown';
    const value = user.status.toString().toLowerCase();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }, [user?.status]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const updated = await usersAPI.updateProfile({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      setUser({
        ...user,
        ...updated,
      });

      Alert.alert('Profile Updated', 'Your profile details have been saved.');
    } catch (error) {
      const appError = handleAPIError(error);
      Alert.alert('Update Failed', getErrorMessage(appError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="person-circle-outline" size={64} color={colors.text.disabled} />
          <Text style={styles.emptyTitle}>No profile loaded</Text>
          <Text style={styles.emptyText}>
            Please log in again to load your rider profile.
          </Text>
          <Button
            title="Log out"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const initial = (user.name || user.phoneNumber || 'R')[0]?.toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>Profile</Text>
            </View>
            <Text style={styles.title}>Rider account</Text>
            <Text style={styles.subtitle}>
              Manage your details and account status.
            </Text>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>{statusLabel}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal details</Text>
          <Input
            label="Full name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            icon={<Ionicons name="person-outline" size={20} color={colors.text.secondary} />}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon={<Ionicons name="mail-outline" size={20} color={colors.text.secondary} />}
          />
          <Input
            label="Phone number"
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            icon={<Ionicons name="call-outline" size={20} color={colors.text.secondary} />}
          />

          <Button
            title="Save changes"
            onPress={handleSave}
            loading={isSaving}
            fullWidth
            style={styles.saveButton}
          />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Joined</Text>
            <Text style={styles.metaValue}>
              {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Last updated</Text>
            <Text style={styles.metaValue}>
              {new Date(user.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Button
            title="Log out"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={20} color={colors.danger} />}
          />
        </View>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    padding: spacing.lg,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerRight: {
    alignItems: 'flex-end',
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
    marginTop: spacing.xs,
  },
  statusPill: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 26,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaColumn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.16)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  metaLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  metaValue: {
    marginTop: spacing.xs,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text.primary,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});

