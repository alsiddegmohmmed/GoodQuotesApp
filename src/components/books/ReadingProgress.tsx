import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export function ReadingProgress({ progress }: { progress: number }) {
  const value = Math.max(0, Math.min(100, progress));
  return <View style={styles.root}>
    <View style={styles.track} accessibilityRole="progressbar" accessibilityLabel="Reading progress" accessibilityValue={{ min: 0, max: 100, now: value }}>
      <View style={[styles.fill, { width: `${value}%` }]} />
    </View>
    <Text style={styles.label}>{value}%</Text>
  </View>;
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  track: { flex: 1, height: 4, backgroundColor: colors.surface3, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accentPrimary, borderRadius: radius.pill },
  label: { ...typography.meta, color: colors.textMuted },
});
