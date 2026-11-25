import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme/tokens';

export function Screen({ children }: { children: ReactNode }) {
  return <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}

export function ScreenHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}

export function SectionHeading({ title }: { title: string }) {
  return <Text accessibilityRole="header" style={styles.section}>{title}</Text>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
  heading: { gap: spacing.xs },
  title: { ...typography.display, color: colors.text, letterSpacing: -0.8 },
  subtitle: { ...typography.caption, color: colors.textMuted },
  section: { ...typography.title, color: colors.text, letterSpacing: -0.4 },
});
