import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MainTab } from '../../navigation/types';
import { colors, spacing } from '../../theme/tokens';

const tabs: { title: MainTab; icon: ComponentProps<typeof Feather>['name'] }[] = [
  { title: 'Today', icon: 'sun' },
  { title: 'Library', icon: 'book-open' },
  { title: 'Discover', icon: 'compass' },
  { title: 'Profile', icon: 'user' },
];

export function BottomNavigation({ active, onSelect }: { active: MainTab; onSelect: (tab: MainTab) => void }) {
  return <View accessibilityRole="tablist" style={styles.bar}>
    {tabs.map(({ title, icon }) => {
      const selected = title === active;
      const color = selected ? colors.text : colors.textMuted;
      return <Pressable key={title} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onSelect(title)} style={styles.item}>
        <Feather name={icon} size={22} color={color} />
        <Text style={[styles.label, { color, fontWeight: selected ? '600' : '400' }]}>{title}</Text>
      </Pressable>;
    })}
  </View>;
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: spacing.sm, paddingTop: spacing.xs, paddingBottom: spacing.xs },
  item: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontSize: 11, lineHeight: 15 },
});
