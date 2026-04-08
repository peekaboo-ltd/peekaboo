import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Switch,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { Image } from 'expo-image';
import axios from 'axios';
import { StatCard } from '../../components/dashboard/StatCard';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../i18n';
import { usersAPI } from '../../services/api/users';
import { dashboardAPI } from '../../services/api/dashboard';
import { colors, typography, spacing } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { OrderAssignmentStatus, UserStatus } from '../../types';

type ReportCaptureType = 'image' | 'video';
type ReportCategory = 'problem' | 'receipt';
type ReportSubmissionPreview = {
  category: ReportCategory;
  mediaUri: string;
  mediaType: ReportCaptureType;
  description: string;
  timestamp: string;
  locationLabel: string;
};

const formatAddressLabel = (address?: Location.LocationGeocodedAddress | null) => {
  if (!address) {
    return '';
  }

  const parts = [
    address.name,
    address.street,
    address.district,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .map((part) => String(part).trim());

  if (parts.length === 0) {
    return '';
  }

  return Array.from(new Set(parts)).join(', ');
};

export default function DashboardScreen() {
  const { width, height } = useWindowDimensions();
  const isCompact = width < 380;
  const isShort = height < 740;
  const { user, logout } = useAuthStore();
  const { t } = useI18n();
  const { setUser } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { 
    stats, 
    recentActivity, 
    pendingCount, 
    isLoading, 
    isRefreshing, 
    error,
    refresh 
  } = useDashboard();
  const headerAnim = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;
  const [isAvailabilityUpdating, setIsAvailabilityUpdating] = useState(false);
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [proofTimestamp, setProofTimestamp] = useState<string>('');
  const [proofLocationLabel, setProofLocationLabel] = useState<string>('');
  const [proofCoordinates, setProofCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [pendingAvailabilityStatus, setPendingAvailabilityStatus] = useState<UserStatus | null>(null);
  const [isProofModalVisible, setIsProofModalVisible] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [isSavingProof, setIsSavingProof] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportMediaUri, setReportMediaUri] = useState<string | null>(null);
  const [reportMediaType, setReportMediaType] = useState<ReportCaptureType>('image');
  const [reportTimestamp, setReportTimestamp] = useState<string>('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportLocationLabel, setReportLocationLabel] = useState('');
  const [reportCategory, setReportCategory] = useState<ReportCategory | null>(null);
  const [isReportConfirmed, setIsReportConfirmed] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSubmissionPreview, setReportSubmissionPreview] = useState<ReportSubmissionPreview | null>(null);
  const displayStatus = pendingAvailabilityStatus ?? user?.status ?? UserStatus.INACTIVE;
  const isShiftActive = displayStatus === UserStatus.ACTIVE;
  const locationCollectedText = useMemo(() => {
    const collectedAt = user?.currentLocation?.collectedAt;

    if (!collectedAt) {
      return t('dashboard.locationWaiting');
    }

    const parsedDate = new Date(collectedAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return t('dashboard.locationRecent');
    }

    return t('dashboard.lastLocationCollected', { date: parsedDate.toLocaleString() });
  }, [t, user?.currentLocation?.collectedAt]);


  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const navigateToAssignments = (filter?: OrderAssignmentStatus | 'ALL') => {
    if (filter) {
      router.push({
        pathname: '/(tabs)/assignments',
        params: { filter },
      });
    } else {
      router.push('/(tabs)/assignments');
    }
  };

  const handleViewAssignments = () => {
    navigateToAssignments('ALL');
  };

  const resetReportState = useCallback(() => {
    setIsReportModalVisible(false);
    setReportMediaUri(null);
    setReportMediaType('image');
    setReportTimestamp('');
    setReportDescription('');
    setReportLocationLabel('');
    setReportCategory(null);
    setIsReportConfirmed(false);
    setIsSendingReport(false);
  }, []);

  const launchReportCamera = useCallback(async (captureType: ReportCaptureType) => {
    const locationPermission = await Location.requestForegroundPermissionsAsync();
    if (!locationPermission.granted) {
      Alert.alert(t('dashboard.permissionLocationTitle'), t('dashboard.permissionLocationMessage'));
      return;
    }

    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert(t('dashboard.permissionCameraTitle'), t('dashboard.permissionCameraMessage'));
      return;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }).catch(() => []);
    const locationLabel = formatAddressLabel(reverseGeocode[0]);

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      mediaTypes:
        captureType === 'video'
          ? ImagePicker.MediaTypeOptions.Videos
          : ImagePicker.MediaTypeOptions.Images,
      videoMaxDuration: 120,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const asset = result.assets[0];
    setReportMediaUri(asset.uri);
    setReportMediaType(asset.type === 'video' ? 'video' : 'image');
    setReportTimestamp(new Date().toLocaleString());
    setReportLocationLabel(locationLabel);
    setReportDescription('');
    setReportCategory(null);
    setIsReportConfirmed(false);
    setIsReportModalVisible(true);
  }, [t]);

  const handleOpenReportProblem = useCallback(() => {
    Alert.alert(t('dashboard.reportOpenTitle'), t('dashboard.reportOpenMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('dashboard.mediaPhoto'),
        onPress: () => {
          void launchReportCamera('image');
        },
      },
      {
        text: t('dashboard.mediaVideo'),
        onPress: () => {
          void launchReportCamera('video');
        },
      },
    ]);
  }, [launchReportCamera, t]);

  const handleRetakeReport = useCallback(() => {
    Alert.alert(t('dashboard.reportRetakeTitle'), t('dashboard.reportRetakeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('dashboard.reportRetake'),
        onPress: () => {
          void launchReportCamera(reportMediaType);
        },
      },
    ]);
  }, [launchReportCamera, reportMediaType, t]);

  const handleConfirmReport = useCallback(() => {
    if (!reportMediaUri) return;
    if (!reportCategory) {
      Alert.alert(t('dashboard.reportTypeRequiredTitle'), t('dashboard.reportTypeRequiredMessageContinue'));
      return;
    }
    setIsReportConfirmed(true);
  }, [reportCategory, reportMediaUri, t]);

  const handleSendReport = useCallback(async () => {
    if (!reportMediaUri) return;
    if (!reportCategory) {
      Alert.alert(t('dashboard.reportTypeRequiredTitle'), t('dashboard.reportTypeRequiredMessageSend'));
      return;
    }
    if (!reportDescription.trim()) {
      Alert.alert(t('dashboard.reportDescriptionRequiredTitle'), t('dashboard.reportDescriptionRequiredMessage'));
      return;
    }

    const reportPrefix =
      reportCategory === 'problem'
        ? `[${t('dashboard.reportProblem')}]`
        : `[${t('dashboard.reportReceipt')}]`;
    const descriptionWithCategory = reportPrefix + ' ' + reportDescription.trim();

    try {
      setIsSendingReport(true);
      await dashboardAPI.submitProblemReport({
        description: descriptionWithCategory,
        submissionType: reportCategory === 'receipt' ? 'RECEIPT' : 'PROBLEM',
        capturedAt: new Date().toISOString(),
        mediaType: reportMediaType,
        evidenceUri: reportMediaUri,
        locationLabel: reportLocationLabel,
      });

      setReportSubmissionPreview({
        category: reportCategory,
        mediaUri: reportMediaUri,
        mediaType: reportMediaType,
        description: descriptionWithCategory,
        timestamp: reportTimestamp || new Date().toLocaleString(),
        locationLabel: reportLocationLabel || t('dashboard.reportLocationUnavailable'),
      });
      resetReportState();
    } catch {
      Alert.alert(t('dashboard.reportSendFailedTitle'), t('dashboard.reportSendFailedMessage'));
    } finally {
      setIsSendingReport(false);
    }
  }, [reportCategory, reportDescription, reportLocationLabel, reportMediaType, reportMediaUri, reportTimestamp, resetReportState, t]);

  const resetProofState = useCallback(() => {
    setProofImageUri(null);
    setProofTimestamp('');
    setProofLocationLabel('');
    setProofCoordinates(null);
    setPendingAvailabilityStatus(null);
    setIsProofModalVisible(false);
  }, []);

  const submitAvailabilityUpdate = useCallback(async () => {
    if (!user || !pendingAvailabilityStatus || !proofCoordinates || !proofImageUri) return;
    const requestedStatus = pendingAvailabilityStatus;

    try {
      setIsSubmittingProof(true);

      const updatedUser = await usersAPI.updateMyStatusWithProof({
        status: requestedStatus,
        latitude: proofCoordinates.latitude,
        longitude: proofCoordinates.longitude,
        locationLabel: proofLocationLabel,
        capturedAt: new Date().toISOString(),
        proofImageUri,
      });
      setUser({
        ...updatedUser,
        status: requestedStatus,
      });
      resetProofState();
    } catch (error) {
      const apiError =
        axios.isAxiosError<{ message?: string }>(error) && error.response?.data?.message
          ? error.response.data.message
          : null;

      Alert.alert(
        t('dashboard.updateFailedTitle'),
        apiError || t('dashboard.checkProofFailed')
      );
    } finally {
      setIsSubmittingProof(false);
    }
  }, [
    pendingAvailabilityStatus,
    proofCoordinates,
    proofImageUri,
    proofLocationLabel,
    resetProofState,
    setUser,
    t,
    user,
  ]);

  const handleRetakePhotoConfirmed = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setProofImageUri(result.assets[0].uri);
      setProofTimestamp(new Date().toLocaleString());
    }
  }, []);

  const handleRetakePhoto = useCallback(() => {
    Alert.alert(t('dashboard.proofRetakeTitle'), t('dashboard.proofRetakeMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.ok'),
        onPress: () => {
          void handleRetakePhotoConfirmed();
        },
      },
    ]);
  }, [handleRetakePhotoConfirmed, t]);

  const handleSaveProof = useCallback(async () => {
    if (!proofImageUri) return;

    try {
      setIsSavingProof(true);
      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t('dashboard.permissionRequiredTitle'),
          t('dashboard.photoLibraryPermissionMessage')
        );
        return;
      }

      const asset = await MediaLibrary.createAssetAsync(proofImageUri);
      const albumName = 'Peekaboo Proofs';
      const existingAlbum = await MediaLibrary.getAlbumAsync(albumName);

      if (existingAlbum) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], existingAlbum, true);
      } else {
        await MediaLibrary.createAlbumAsync(albumName, asset, true);
      }

      Alert.alert(t('dashboard.savedTitle'), t('dashboard.savedMessage', { albumName }));
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : t('dashboard.saveFailedMessage');
      Alert.alert(t('dashboard.saveFailedTitle'), errorMessage);
    } finally {
      setIsSavingProof(false);
    }
  }, [proofImageUri, t]);

  const handleAvailabilityToggle = async (value: boolean) => {
    if (!user || isAvailabilityUpdating) return;

    setIsAvailabilityUpdating(true);
    const nextStatus = value ? UserStatus.ACTIVE : UserStatus.INACTIVE;

    try {
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (!locationPermission.granted) {
        Alert.alert(t('dashboard.permissionLocationTitle'), t('dashboard.permissionLocationMessage'));
        return;
      }

      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        Alert.alert(t('dashboard.permissionCameraTitle'), t('dashboard.permissionCameraMessage'));
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }).catch(() => []);

      const timestamp = new Date().toLocaleString();
      const locationLabel = formatAddressLabel(reverseGeocode[0]);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setProofImageUri(result.assets[0].uri);
        setProofTimestamp(timestamp);
        setProofLocationLabel(locationLabel);
        setProofCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setPendingAvailabilityStatus(nextStatus);
        setIsProofModalVisible(true);
      }
    } catch {
      Alert.alert(t('dashboard.updateFailedTitle'), t('dashboard.updateFailedMessage'));
    } finally {
      setIsAvailabilityUpdating(false);
    }
  };

  const proofActionLabel = pendingAvailabilityStatus === UserStatus.ACTIVE
    ? t('dashboard.proofSendCheckIn')
    : t('dashboard.proofSendCheckOut');

  useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(activityAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activityAnim, headerAnim, heroAnim, statsAnim]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowMid} />
        <View style={styles.glowBottom} />
      </View>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          isCompact && styles.headerCompact,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.headerSurface, isCompact && styles.headerSurfaceCompact]}>
          <View style={styles.headerLeft}>
            <View style={styles.kickerRow}>
              <View style={styles.kickerDot} />
              <Text style={styles.kicker}>{t('dashboard.kicker')}</Text>
            </View>
            <Text style={styles.greeting}>{t('dashboard.welcomeBack')}</Text>
            <Text style={[styles.userName, isCompact && styles.userNameCompact]}>{user?.name || t('dashboard.defaultRider')}</Text>
            <Text style={styles.subline}>{t('dashboard.readyRoutes')}</Text>
          </View>
          <View style={[styles.headerRight, isCompact && styles.headerRightCompact]}>
              <View style={[styles.shiftControlRow, isCompact && styles.shiftControlRowCompact]}>
              <View
                style={[
                  styles.statusPill,
                  isShiftActive ? styles.statusPillActive : styles.statusPillInactive,
                ]}
              >
                <Ionicons
                  name={isShiftActive ? 'pulse' : 'pause-circle-outline'}
                  size={14}
                  color={isShiftActive ? colors.success : colors.warning}
                />
                <Text style={[styles.statusText, isCompact && styles.statusTextCompact]}>
                  {isShiftActive ? t('dashboard.shiftActive') : t('dashboard.shiftInactive')}
                </Text>
              </View>
              <Switch
                value={isShiftActive}
                onValueChange={handleAvailabilityToggle}
                disabled={isAvailabilityUpdating}
                trackColor={{ false: 'rgba(95, 149, 152, 0.2)', true: colors.primaryLight }}
                thumbColor={colors.text.inverse}
              />
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name || 'R')[0]?.toUpperCase()}
              </Text>
            </View>
            <Button
              title=""
              onPress={handleLogout}
              variant="ghost"
              icon={<Ionicons name="log-out-outline" size={22} color={colors.text.secondary} />}
              style={styles.logoutButton}
            />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isCompact && styles.scrollContentCompact,
          isShort && styles.scrollContentShort,
          { paddingBottom: spacing.xxl + 60 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Animated.View
          style={[
            styles.heroCard,
            isCompact && styles.heroCardCompact,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.heroHighlight} />
          <View style={[styles.heroHeader, isCompact && styles.heroHeaderCompact]}>
            <View>
              <Text style={styles.heroKicker}>{t('dashboard.todaysFocus')}</Text>
              <Text style={styles.heroSubtitle}>{t('dashboard.keepMomentum')}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={styles.heroBadgeText}>
                {pendingCount} {t('dashboard.pending')}
              </Text>
            </View>
          </View>
          <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}>{t('dashboard.stayTop')}</Text>
          <View style={[styles.heroStatsRow, isCompact && styles.heroStatsRowCompact]}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{t('dashboard.earnings')}</Text>
              <Text style={styles.heroStatValue}>
                {formatCurrency(stats?.totalEarnings ?? 0)}
              </Text>
            </View>
            <View style={[styles.heroDivider, isCompact && styles.heroDividerCompact]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{t('dashboard.completed')}</Text>
              <Text style={styles.heroStatValue}>
                {stats?.completedToday ?? 0}
              </Text>
            </View>
          </View>
          {pendingCount > 0 && (
            <Card style={styles.alertCard} onPress={handleViewAssignments}>
              <View style={styles.alertContent}>
                <View style={styles.alertIconContainer}>
                  <Ionicons name="notifications" size={18} color={colors.warning} />
                </View>
                <View style={styles.alertText}>
                  <Text style={styles.alertTitle}>
                    {pendingCount === 1
                      ? t('dashboard.pendingAssignment', { count: pendingCount })
                      : t('dashboard.pendingAssignments', { count: pendingCount })}
                  </Text>
                  <Text style={styles.alertSubtitle}>{t('dashboard.tapToView')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
              </View>
            </Card>
          )}
        </Animated.View>

        {/* Stats Section */}
        <Card style={styles.locationDisclaimerCard}>
          <View style={styles.locationDisclaimerContent}>
            <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
            <Text style={styles.locationDisclaimerText}>{locationCollectedText}</Text>
          </View>
        </Card>

        <Animated.View
          style={[
            styles.section,
            {
              opacity: statsAnim,
              transform: [
                {
                  translateY: statsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.sectionHeader, isCompact && styles.sectionHeaderCompact]}>
            <View>
              <Text style={styles.sectionKicker}>{t('dashboard.overview')}</Text>
              <Text style={styles.sectionTitle}>{t('dashboard.snapshot')}</Text>
            </View>
            <Text style={styles.sectionHint}>{t('dashboard.updatedNow')}</Text>
          </View>
          <View style={styles.statsGrid}>
            <StatCard
              title={t('dashboard.deliveries')}
              value={stats?.todayDeliveries ?? 0}
              icon="bicycle"
              iconColor={colors.primary}
              onPress={() => navigateToAssignments('ALL')}
            />
            <StatCard
              title={t('assignments.pending')}
              value={stats?.pendingAssignments ?? pendingCount}
              icon="time"
              iconColor={colors.warning}
              onPress={() => navigateToAssignments(OrderAssignmentStatus.PENDING)}
            />
            <StatCard
              title={t('assignments.completed')}
              value={stats?.completedToday ?? 0}
              icon="checkmark-circle"
              iconColor={colors.success}
              onPress={() => navigateToAssignments(OrderAssignmentStatus.COMPLETED)}
            />
            <StatCard
              title={t('dashboard.earnings')}
              value={formatCurrency(stats?.totalEarnings ?? 0)}
              icon="cash"
              iconColor={colors.success}
              onPress={() => navigateToAssignments('ALL')}
            />
          </View>

          <View style={styles.earningsSummary}>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>{t('profile.deliveriesToday')}</Text>
              <Text style={styles.earningsValue}>{stats?.completedToday ?? 0}</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>{t('dashboard.bonusActivated')}</Text>
              <Text style={styles.earningsValue}>{stats?.bonusActive ? t('common.yes') : t('common.no')}</Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>{t('dashboard.earnings')}</Text>
              <Text style={styles.earningsValue}>{formatCurrency(stats?.totalEarnings ?? 0)}</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionKicker}>{t('dashboard.shortcuts')}</Text>
              <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
            </View>
            <Text style={styles.sectionHint}>{t('dashboard.stayOnTrack')}</Text>
          </View>
          <View style={[styles.quickActions, isCompact && styles.quickActionsCompact]}>
            <Card style={styles.actionCard} onPress={handleViewAssignments}>
              <View style={[styles.actionIconContainer, styles.actionIconContainerPrimary]}>
                <Ionicons name="list" size={22} color={colors.primary} />
              </View>
              <View style={styles.actionBody}>
                <Text style={styles.actionText}>{t('dashboard.viewAssignments')}</Text>
                <Text style={styles.actionSubtext}>{t('dashboard.acceptAndStart')}</Text>
              </View>
              <View style={styles.actionChevronWrap}>
                <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
              </View>
            </Card>
            <Card style={styles.actionCard} onPress={handleOpenReportProblem}>
              <View style={[styles.actionIconContainer, styles.actionIconContainerWarning]}>
                <Ionicons name="alert-circle-outline" size={22} color={colors.warning} />
              </View>
              <View style={styles.actionBody}>
                <Text style={styles.actionText}>{t('dashboard.reportActionTitle')}</Text>
                <Text style={styles.actionSubtext}>{t('dashboard.reportActionSubtitle')}</Text>
              </View>
              <View style={styles.actionChevronWrap}>
                <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
              </View>
            </Card>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: activityAnim,
              transform: [
                {
                  translateY: activityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.sectionHeader, isCompact && styles.sectionHeaderCompact]}>
            <View>
              <Text style={styles.sectionKicker}>{t('dashboard.timeline')}</Text>
              <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>
            </View>
            <Text style={styles.sectionHint}>{t('dashboard.last7Days')}</Text>
          </View>
          <RecentActivity 
            activities={recentActivity || []} 
            onActivityPress={(activity) => {
              if (activity.assignmentId) {
                router.push(`/assignment/${activity.assignmentId}`);
              }
            }}
          />

          {/* Error Display */}
          {error && (
            <Card style={styles.errorCard}>
              <Ionicons name="alert-circle" size={24} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <Button
                title={t('common.retry')}
                onPress={handleRefresh}
                variant="outline"
                size="small"
              />
            </Card>
          )}
        </Animated.View>
      </ScrollView>

      <Modal
        visible={isReportModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={resetReportState}
      >
        <KeyboardAvoidingView
          style={styles.reportModalKeyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
        >
          <View style={[styles.proofModalContainer, isCompact && styles.proofModalContainerCompact]}>
          <View style={styles.proofHeader}>
              <Text style={styles.reportTitle}>{t('dashboard.reportModalTitle')}</Text>
              <TouchableOpacity
                onPress={resetReportState}
                style={styles.proofCloseButton}
                disabled={isSendingReport}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.reportModalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {reportMediaUri ? (
                <View style={styles.proofImageWrap}>
                  {reportMediaType === 'image' ? (
                    <Image source={{ uri: reportMediaUri }} style={styles.proofImage} contentFit="cover" />
                  ) : (
                    <View style={styles.videoPreview}>
                      <Image
                        source={require('../../assets/images/peekaboo-watermark.jpeg')}
                        style={styles.proofWatermark}
                        contentFit="contain"
                      />
                      <Ionicons name="videocam" size={48} color={colors.text.inverse} />
                      <Text style={styles.videoPreviewText}>{t('dashboard.reportVideoCaptured')}</Text>
                    </View>
                  )}
                  <Image
                    source={require('../../assets/images/peekaboo-watermark.jpeg')}
                    style={styles.proofWatermark}
                    contentFit="contain"
                  />
                  <View style={styles.proofOverlay}>
                    <Text style={styles.proofOverlayText}>{t('dashboard.reportTimestamp')}: {reportTimestamp}</Text>
                    <Text style={styles.proofOverlayText}>
                      {t('dashboard.reportLocation')}: {reportLocationLabel || t('dashboard.reportLocationUnavailable')}
                    </Text>
                    <Text style={styles.proofOverlayText}>
                      {t('dashboard.reportType')}: {reportMediaType === 'video' ? t('dashboard.mediaVideo') : t('dashboard.mediaPhoto')}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.reportTypeSection}>
                <Text style={styles.reportLabel}>{t('dashboard.reportChooseType')}</Text>
                <View style={[styles.reportTypeSelector, isCompact && styles.reportTypeSelectorCompact]}>
                  <TouchableOpacity
                    onPress={() => setReportCategory('problem')}
                    style={[
                      styles.reportTypeChip,
                      reportCategory === 'problem' && styles.reportTypeChipActive,
                    ]}
                    activeOpacity={0.85}
                    disabled={isSendingReport}
                  >
                    <Text
                      style={[
                        styles.reportTypeChipText,
                        reportCategory === 'problem' && styles.reportTypeChipTextActive,
                      ]}
                    >
                      {t('dashboard.reportProblem')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setReportCategory('receipt')}
                    style={[
                      styles.reportTypeChip,
                      reportCategory === 'receipt' && styles.reportTypeChipActive,
                    ]}
                    activeOpacity={0.85}
                    disabled={isSendingReport}
                  >
                    <Text
                      style={[
                        styles.reportTypeChipText,
                        reportCategory === 'receipt' && styles.reportTypeChipTextActive,
                      ]}
                    >
                      {t('dashboard.reportReceipt')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {isReportConfirmed && (
                <View style={styles.reportForm}>
                  <Text style={styles.reportLabel}>{t('dashboard.reportDescription')}</Text>
                  <TextInput
                    style={styles.reportInput}
                    value={reportDescription}
                    onChangeText={setReportDescription}
                    placeholder={
                      reportCategory === 'receipt'
                        ? t('dashboard.reportDescribeReceipt')
                        : t('dashboard.reportDescribeProblem')
                    }
                    placeholderTextColor={colors.text.disabled}
                    multiline
                    textAlignVertical="top"
                    editable={!isSendingReport}
                    returnKeyType="default"
                    blurOnSubmit={false}
                  />
                </View>
              )}
            </ScrollView>

            <View style={styles.reportFooterActions}>
              {!isReportConfirmed ? (
                <>
                  <Button
                    title={t('dashboard.reportRetake')}
                    onPress={handleRetakeReport}
                    variant="outline"
                    fullWidth
                    disabled={isSendingReport}
                  />
                  <Button
                    title={t('dashboard.reportConfirm')}
                    onPress={handleConfirmReport}
                    fullWidth
                    disabled={!reportMediaUri || !reportCategory || isSendingReport}
                    icon={<Ionicons name="checkmark" size={16} color={colors.text.inverse} />}
                  />
                </>
              ) : (
                <Button
                  title={t('dashboard.reportSend')}
                  onPress={handleSendReport}
                  fullWidth
                  loading={isSendingReport}
                  disabled={isSendingReport}
                  icon={<Ionicons name="send" size={16} color={colors.text.inverse} />}
                />
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={Boolean(reportSubmissionPreview)}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setReportSubmissionPreview(null)}
      >
        <View style={styles.proofModalContainer}>
          <View style={styles.proofHeader}>
            <Text style={styles.reportTitle}>{t('dashboard.reportSubmitted')}</Text>
            <TouchableOpacity
              onPress={() => setReportSubmissionPreview(null)}
              style={styles.proofCloseButton}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {reportSubmissionPreview?.mediaType === 'image' ? (
            <View style={styles.proofImageWrap}>
              <Image source={{ uri: reportSubmissionPreview.mediaUri }} style={styles.proofImage} contentFit="cover" />
              <Image
                source={require('../../assets/images/peekaboo-watermark.jpeg')}
                style={styles.proofWatermark}
                contentFit="contain"
              />
              <View style={styles.proofOverlay}>
                <Text style={styles.proofOverlayText}>{t('dashboard.reportTimestamp')}: {reportSubmissionPreview.timestamp}</Text>
                <Text style={styles.proofOverlayText}>{t('dashboard.reportLocation')}: {reportSubmissionPreview.locationLabel}</Text>
                <Text style={styles.proofOverlayText}>{t('dashboard.reportType')}: {t('dashboard.mediaPhoto')}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.videoPreviewSubmitted}>
              <Image
                source={require('../../assets/images/peekaboo-watermark.jpeg')}
                style={styles.proofWatermark}
                contentFit="contain"
              />
              <Ionicons name="videocam" size={56} color={colors.text.inverse} />
              <Text style={styles.videoPreviewText}>{t('dashboard.reportVideoEvidenceSubmitted')}</Text>
              <Text style={styles.videoMetaText}>{t('dashboard.reportTimestamp')}: {reportSubmissionPreview?.timestamp}</Text>
              <Text style={styles.videoMetaText}>{t('dashboard.reportLocation')}: {reportSubmissionPreview?.locationLabel}</Text>
            </View>
          )}

          <View style={styles.reportSubmissionSummary}>
            <Text style={styles.reportLabel}>{t('dashboard.reportType')}</Text>
            <Text style={styles.reportSummaryText}>
              {reportSubmissionPreview?.category === 'receipt' ? t('dashboard.reportReceipt') : t('dashboard.reportProblem')}
            </Text>
            <Text style={styles.reportLabel}>{t('dashboard.reportDescription')}</Text>
            <Text style={styles.reportSummaryText}>
              {reportSubmissionPreview?.description || t('dashboard.reportNoDescription')}
            </Text>
            <Button
              title={t('dashboard.reportDone')}
              onPress={() => setReportSubmissionPreview(null)}
              fullWidth
              icon={<Ionicons name="checkmark-circle-outline" size={16} color={colors.text.inverse} />}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={isProofModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={resetProofState}
      >
        <View style={styles.proofModalContainer}>
          <View style={styles.proofHeader}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.proofLogo}
              contentFit="contain"
            />
            <TouchableOpacity
              onPress={resetProofState}
              style={styles.proofCloseButton}
              disabled={isSubmittingProof}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {proofImageUri ? (
            <View style={styles.proofImageWrap}>
              <Image source={{ uri: proofImageUri }} style={styles.proofImage} contentFit="cover" />
              <Image
                source={require('../../assets/images/peekaboo-watermark.jpeg')}
                style={styles.proofWatermark}
                contentFit="contain"
              />
              <View style={styles.proofOverlay}>
                <Text style={styles.proofOverlayText}>{t('dashboard.reportTimestamp')}: {proofTimestamp}</Text>
                <Text style={styles.proofOverlayText}>{t('dashboard.reportLocation')}: {proofLocationLabel}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.proofActions}>
            <Button
              title={t('dashboard.reportRetake')}
              onPress={handleRetakePhoto}
              variant="outline"
              fullWidth
              disabled={isSubmittingProof || isSavingProof}
            />
            <Button
              title={t('dashboard.proofSave')}
              onPress={handleSaveProof}
              variant="secondary"
              fullWidth
              loading={isSavingProof}
              disabled={isSubmittingProof || !proofImageUri}
              icon={<Ionicons name="download-outline" size={16} color={colors.text.primary} />}
            />
            <Button
              title={proofActionLabel}
              onPress={submitAvailabilityUpdate}
              fullWidth
              loading={isSubmittingProof}
              disabled={isSavingProof}
              icon={<Ionicons name="send" size={16} color={colors.text.inverse} />}
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'rgba(95, 149, 152, 0.08)',
    top: -140,
    right: -120,
  },
  glowMid: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(29, 84, 109, 0.08)',
    top: 220,
    left: -110,
  },
  glowBottom: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    bottom: -90,
    right: -70,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerCompact: {
    paddingHorizontal: spacing.sm,
  },
  headerSurface: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  headerSurfaceCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  headerRightCompact: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  shiftControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  shiftControlRowCompact: {
    width: '100%',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusPillInactive: {
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statusTextCompact: {
    fontSize: 10,
    letterSpacing: 0.4,
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
  greeting: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  userNameCompact: {
    fontSize: typography.h3.fontSize,
  },
  subline: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.disabled,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'rgba(29, 84, 109, 0.15)',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  scrollContentCompact: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  scrollContentShort: {
    paddingBottom: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    marginTop: spacing.lg,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  heroCardCompact: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  heroHighlight: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 84, 109, 0.05)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  heroHeaderCompact: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  heroKicker: {
    fontSize: typography.caption.fontSize,
    textTransform: 'uppercase',
    letterSpacing: 2.2,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  heroSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.caption.fontSize,
    color: colors.text.disabled,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  heroTitleCompact: {
    fontSize: typography.body.fontSize,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  heroStatsRowCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  heroStat: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
  },
  heroStatValue: {
    marginTop: 4,
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text.primary,
  },
  heroDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(95, 149, 152, 0.2)',
    marginHorizontal: spacing.md,
  },
  heroDividerCompact: {
    width: '100%',
    height: 1,
    marginHorizontal: 0,
    marginVertical: spacing.xs,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 251, 235, 0.9)',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.warning}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  alertSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionHeaderCompact: {
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  sectionKicker: {
    fontSize: typography.caption.fontSize,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.text.disabled,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: typography.caption.fontSize,
    color: colors.text.disabled,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.xs, // Negative margin to offset card margins
  },
  earningsSummary: {
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(95, 149, 152, 0.08)',
    borderRadius: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  earningsLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  earningsValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  quickActions: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionsCompact: {
    flexDirection: 'column',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: 88,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.14)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: 'rgba(29, 84, 109, 0.1)',
  },
  actionIconContainerPrimary: {
    backgroundColor: 'rgba(29, 84, 109, 0.1)',
  },
  actionIconContainerWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.13)',
  },
  actionBody: {
    flex: 1,
    minWidth: 0,
  },
  actionChevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(95, 149, 152, 0.14)',
  },
  actionText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
    lineHeight: 20,
  },
  actionSubtext: {
    marginTop: 3,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  locationDisclaimerCard: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.2)',
    backgroundColor: 'rgba(243, 244, 244, 0.85)',
  },
  locationDisclaimerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationDisclaimerText: {
    flex: 1,
    fontSize: typography.caption.fontSize,
    color: colors.text.secondary,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  errorText: {
    flex: 1,
    fontSize: typography.bodySmall.fontSize,
    color: colors.danger,
  },
  proofModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  proofModalContainerCompact: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  reportModalKeyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  reportModalScrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  proofLogo: {
    width: 120,
    height: 42,
  },
  proofCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  proofImageWrap: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },

  proofWatermark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 76,
    height: 48,
    opacity: 0.95,
    borderRadius: 6,
  },
  proofOverlay: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  proofOverlayText: {
    color: colors.text.inverse,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  proofActions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  reportTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.text.primary,
  },
  videoPreview: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  videoPreviewText: {
    color: colors.text.inverse,
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  videoPreviewSubmitted: {
    minHeight: 260,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  videoMetaText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
  },
  reportTypeSection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  reportTypeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reportTypeSelectorCompact: {
    flexDirection: 'column',
  },
  reportTypeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.35)',
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  reportTypeChipActive: {
    backgroundColor: 'rgba(29, 84, 109, 0.12)',
    borderColor: colors.primary,
  },
  reportTypeChipText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  reportTypeChipTextActive: {
    color: colors.primaryDark,
  },
  reportForm: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  reportFooterActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  reportSubmissionSummary: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  reportSummaryText: {
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.3)',
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.primary,
  },
  reportLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  reportInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.3)',
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.text.primary,
  },
});
