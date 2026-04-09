import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Linking, useWindowDimensions, Platform } from 'react-native';
import { Button } from '../ui/Button';
import { formatDistance } from '../../utils/formatters';
import { typography, spacing, type AppColors } from '../../utils/constants';
import { useI18n } from '../../i18n';
import { useTheme } from '../../contexts/theme-context';

type WebViewComponentType = React.ComponentType<{
  source: { uri: string };
  style?: object;
  scrollEnabled?: boolean;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
}>;

function useNativeWebView(): WebViewComponentType | null {
  return useMemo(() => {
    if (Platform.OS === 'web') return null;
    try {
      return require('react-native-webview').WebView as WebViewComponentType;
    } catch (e) {
      if (__DEV__) {
        console.warn(
          '[peekaboo/maps] react-native-webview not linked. Rebuild the dev client, or open directions in Google Maps.',
          e
        );
      }
      return null;
    }
  }, []);
}

/**
 * Approximate distance in meters between two coordinates (haversine).
 */
function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface AssignmentDirectionsMapProps {
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  onClose?: () => void;
}

export const AssignmentDirectionsMap: React.FC<AssignmentDirectionsMapProps> = ({
  origin,
  destination,
  onClose,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useI18n();
  const WebView = useNativeWebView();
  const { height } = useWindowDimensions();
  const mapHeight = Math.min(height * 0.5, 360);

  const url = `https://www.google.com/maps/dir/${origin.latitude},${origin.longitude}/${destination.latitude},${destination.longitude}`;
  const distanceMeters = haversineMeters(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );

  const handleOpenInMaps = () => {
    Linking.openURL(url).catch(() => {});
  };

  const isWeb = Platform.OS === 'web';

  return (
    <View style={styles.container}>
      <View style={styles.distanceRow}>
        <Text style={styles.distanceLabel}>{t('map.approxDistance')}</Text>
        <Text style={styles.distanceValue}>{formatDistance(distanceMeters)}</Text>
      </View>
      <View style={[styles.webViewContainer, { height: mapHeight }]}>
        {isWeb || !WebView ? (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackText}>
              {t('map.webFallback')}
            </Text>
            <Button
              title={t('map.openGoogleMaps')}
              onPress={handleOpenInMaps}
              variant="primary"
              size="small"
              style={styles.webFallbackButton}
            />
          </View>
        ) : (
          <WebView
            source={{ uri: url }}
            style={styles.webView}
            scrollEnabled
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </View>
      <View style={styles.actions}>
        <Button
          title={t('map.openGoogleMaps')}
          onPress={handleOpenInMaps}
          variant="outline"
          size="small"
          style={styles.openButton}
        />
        {onClose && (
          <Button
            title={t('common.close')}
            onPress={onClose}
            variant="ghost"
            size="small"
            style={styles.closeButton}
          />
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  distanceLabel: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  distanceValue: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  webViewContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  webView: {
    flex: 1,
    width: '100%',
  },
  webFallback: {
    flex: 1,
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  webFallbackText: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  webFallbackButton: {
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  openButton: {},
  closeButton: {},
});
