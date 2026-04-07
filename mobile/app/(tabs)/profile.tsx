import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/authStore';
import { usersAPI, UpdateUserPayload } from '../../services/api/users';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { useI18n } from '../../i18n';
import { colors, spacing, typography, borderRadius, shadows } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

export default function ProfileScreen() {
  const { t } = useI18n();
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
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

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
    switch (user.status) {
      case 'ACTIVE':
        return t('assignment.active');
      default:
        return user.status.charAt(0) + user.status.slice(1).toLowerCase();
    }
  }, [t, user]);

  const handlePickImage = async (fromCamera: boolean) => {
    if (!user) return;

    const permissionResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        t('profile.permissionRequired'),
        fromCamera
          ? t('profile.cameraPermission')
          : t('profile.libraryPermission')
      );
      return;
    }

    const pickerResult = fromCamera
      ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (pickerResult.canceled) {
      return;
    }

    const asset = pickerResult.assets[0];
    if (!asset.uri) return;

    setIsAvatarLoading(true);
    setError(null);

    try {
      const updatedUser = await usersAPI.uploadAvatar(user.id, asset.uri);
      setUser(updatedUser);
    } catch (e) {
      Alert.alert(t('profile.uploadFailed'), t('profile.uploadFailedMessage'));
    } finally {
      setIsAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = () => {
    if (!user) return;

    Alert.alert(
      t('profile.removePhotoTitle'),
      t('profile.removePhotoMessage'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.remove'),
          style: 'destructive',
          onPress: async () => {
            setIsAvatarLoading(true);
            setError(null);
            try {
              const updatedUser = await usersAPI.removeAvatar(user.id);
              setUser(updatedUser);
            } catch (e) {
              Alert.alert(t('profile.removeFailed'), t('profile.removeFailedMessage'));
            } finally {
              setIsAvatarLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleChangePhoto = () => {
    if (!user) return;

    Alert.alert(
      t('profile.photoTitle'),
      t('profile.photoMessage'),
      [
        {
          text: t('profile.takePhoto'),
          onPress: () => handlePickImage(true),
        },
        {
          text: t('profile.chooseFromLibrary'),
          onPress: () => handlePickImage(false),
        },
        {
          text: t('profile.removePhoto'),
          style: 'destructive',
          onPress: handleRemoveAvatar,
        },
        {
          text: t('profile.cancel'),
          style: 'cancel',
        },
      ]
    );
  };

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
      Alert.alert(t('profile.profileUpdated'), t('profile.profileUpdatedMessage'));
    } catch (e) {
      setError(t('profile.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>
          {isLoading ? t('profile.loading') : t('profile.noData')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerCard}>
        <TouchableOpacity
          onPress={handleChangePhoto}
          disabled={isAvatarLoading}
          activeOpacity={0.7}
          style={styles.avatarButton}
        >
          <View style={styles.avatar}>
            {user && (user as any).profilePhotoUrl ? (
              <Image
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                source={{ uri: (user as any).profilePhotoUrl as string }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{user.name || t('profile.unnamedRider')}</Text>
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
        <Text style={styles.sectionTitle}>{t('profile.infoTitle')}</Text>
        <LanguageSwitcher />

        <Input
          label={t('profile.fullName')}
          value={name}
          onChangeText={setName}
          placeholder={t('profile.fullNamePlaceholder')}
          editable={isEditing}
        />

        <Input
          label={t('profile.email')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('profile.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
        />

        <Input
          label={t('profile.phoneNumber')}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder={t('profile.phonePlaceholder')}
          keyboardType="phone-pad"
          editable={isEditing}
        />

        <Input
          label={t('profile.dateOfBirth')}
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          editable={isEditing}
        />

        <Input
          label={t('profile.nationality')}
          value={nationality}
          onChangeText={setNationality}
          placeholder={t('profile.nationalityPlaceholder')}
          editable={isEditing}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.performanceTitle')}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('profile.deliveriesToday')}</Text>
          <Text style={styles.metaValue}>{stats?.completedToday ?? 0}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('dashboard.bonusActivated')}</Text>
          <Text style={styles.metaValue}>{stats?.bonusActive ? t('common.yes') : t('common.no')}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>{t('dashboard.earnings')}</Text>
          <Text style={styles.metaValue}>{stats?.totalEarnings != null ? formatCurrency(stats.totalEarnings) : 'RWF 0'}</Text>
        </View>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.actionsRow}>
        {isEditing ? (
          <>
            <Button
              title={t('common.cancel')}
              variant="outline"
              onPress={handleCancelEdit}
              style={styles.actionButton}
              disabled={isSaving}
            />
            <Button
              title={t('profile.saveChanges')}
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              style={styles.actionButton}
            />
          </>
        ) : (
          <Button
            title={t('profile.editProfile')}
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
  avatarButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.full,
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
