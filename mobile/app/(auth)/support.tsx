import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { colors, spacing, typography } from '../../utils/constants';

const ADDRESS = 'Niboye, Kicukiro, Kigali, Rwanda';
const PHONE_LABEL = '(+250) 794 892 784';
const PHONE_URL = 'tel:+250794892784';
const EMAIL_LABEL = 'info@peekaboo.co.rw';
const EMAIL_URL = 'mailto:info@peekaboo.co.rw';
const COPYRIGHT = '© 2026 Peekaboo. Peekaboo Ltd. All rights reserved.';

const openLink = async (url: string) => {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
};

export default function SupportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />
      </View>

      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.85}>
          <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Card style={styles.card} padding="lg" elevation="md">
          <Text style={styles.title}>Contact Support</Text>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.value}>{ADDRESS}</Text>
          </View>

          <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={() => void openLink(PHONE_URL)}>
            <Ionicons name="call-outline" size={18} color={colors.primary} />
            <Text style={[styles.value, styles.link]}>{PHONE_LABEL}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} activeOpacity={0.85} onPress={() => void openLink(EMAIL_URL)}>
            <Ionicons name="mail-outline" size={18} color={colors.primary} />
            <Text style={[styles.value, styles.link]}>{EMAIL_LABEL}</Text>
          </TouchableOpacity>

          <Text style={styles.copy}>{COPYRIGHT}</Text>
        </Card>
      </View>
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
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(95, 149, 152, 0.16)',
    top: -120,
    right: -90,
  },
  glowBottom: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(29, 84, 109, 0.1)',
    bottom: -90,
    left: -70,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.25)',
  },
  backText: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(95, 149, 152, 0.25)',
    gap: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  value: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  link: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  copy: {
    marginTop: spacing.md,
    fontSize: typography.caption.fontSize,
    color: colors.text.disabled,
    lineHeight: 18,
  },
});
