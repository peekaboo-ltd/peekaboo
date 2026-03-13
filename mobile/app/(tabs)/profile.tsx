import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/authStore';
import { usersAPI, UpdateUserPayload } from '../../services/api/users';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/constants';

export default function ProfileScreen() {
  const { user, isLoading } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const { stats } = useDashboard();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? '');
  const [nationality, setNationality] = useState(user?.nationality ?? '');

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (user?.phoneNumber) {
      return user.phoneNumber.slice(-2);
    }
    return '--';
  }, [user]);

  const statusLabel = useMemo(() => {
    if (!user?.status) return '';
    return user.status.charAt(0) + user.status.slice(1).toLowerCase();
  }, [user]);

  const handleStartEdit = () => {
    if (!user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setPhoneNumber(user.phoneNumber ?? '');
    setDateOfBirth(user.dateOfBirth ?? '');
    setNationality(user.nationality ?? '');
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (!user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setPhoneNumber(user.phoneNumber ?? '');
    setDateOfBirth(user.dateOfBirth ?? '');
    setNationality(user.nationality ?? '');
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    const payload: UpdateUserPayload = {
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      dateOfBirth: dateOfBirth.trim() || undefined,
      nationality: nationality.trim() || undefined,
    };

    setIsSaving(true);
    setError(null);

    try {
      const updatedUser = await usersAPI.updateUser(user.id, payload);
      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert('Profile updated', 'Your profile has been updated successfully.');
    } catch (e) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>
          {isLoading ? 'Loading your profile...' : 'No user data available.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{user.name || 'Unnamed rider'}</Text>
          <Text style={styles.subtitle}>{user.phoneNumber}</Text>
          {user.email ? <Text style={styles.subtitle}>{user.email}</Text> : null}
        </View>
        <View style={styles.statusPill}>
          <Ionicons
            name={user.status === 'ACTIVE' ? 'checkmark-circle' : 'alert-circle'}
            size={16}
            color={colors.text.inverse}
          />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile information</Text>

        <Input
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          editable={isEditing}
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={isEditing}
        />

        <Input
          label="Phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          editable={isEditing}
        />

        <Input
          label="Date of birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          editable={isEditing}
        />

        <Input
          label="Nationality"
          value={nationality}
          onChangeText={setNationality}
          placeholder="Enter your nationality"
          editable={isEditing}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today’s performance</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Deliveries completed today</Text>
          <Text style={styles.metaValue}>{stats?.completedToday ?? 0}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Total deliveries today</Text>
          <Text style={styles.metaValue}>{stats?.todayDeliveries ?? 0}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Total assignments</Text>
          <Text style={styles.metaValue}>{stats?.totalAssignments ?? 0}</Text>
        </View>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.actionsRow}>
        {isEditing ? (
          <>
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleCancelEdit}
              style={styles.actionButton}
            />
            <Button
              title="Save changes"
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              style={styles.actionButton}
            />
          </>
        ) : (
          <Button
            title="Edit profile"
            onPress={handleStartEdit}
            style={styles.singleActionButton}
            icon={<Ionicons name="create-outline" size={18} color={colors.text.inverse} />}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  centeredText: {
    color: colors.text.secondary,
    fontSize: typography.body.fontSize,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 24,
    fontWeight: '700',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  statusText: {
    marginLeft: spacing.xs,
    color: colors.text.inverse,
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  metaLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  metaValue: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.primary,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.bodySmall.fontSize,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  singleActionButton: {
    flex: 1,
  },
});

