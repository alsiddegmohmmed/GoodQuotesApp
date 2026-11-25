import { useState } from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/navigation/BottomNavigation';
import { Screen, ScreenHeading } from '../components/layout/Screen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { colors, radius, spacing, typography } from '../theme/tokens';
import type { MainTab, RootStackParamList } from './types';

export function MainTabs({ navigation }: StackScreenProps<RootStackParamList, 'Main'>) {
  const [active, setActive] = useState<MainTab>('Today');
  const openBook = (bookId: string) => navigation.navigate('BookDetail', { bookId });
  return <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safe}>
    <View style={styles.content}>
      {active === 'Today' ? <TodayScreen onOpenBook={openBook} /> : active === 'Library' ? <LibraryScreen onOpenBook={openBook} onAdd={() => navigation.navigate('LibraryTools', { mode: 'add' })} onImport={() => navigation.navigate('LibraryTools', { mode: 'import' })} /> : active === 'Discover' ? <Screen><ScreenHeading title="Discover" subtitle="Explore connections and new reading directions." /><Text style={styles.body}>This experience is not designed or connected yet.</Text></Screen> : <Screen><ScreenHeading title="Profile" subtitle="Your personal reading memory." /><Text style={styles.body}>Reading statistics, preferences and saved passages will be designed later.</Text><Pressable accessibilityRole="button" onPress={() => navigation.navigate('LegacyQuotes')} style={styles.legacy}><Text style={styles.link}>Open original quote feed</Text><Text style={styles.meta}>Requires the existing backend.</Text></Pressable></Screen>}
    </View>
    <BottomNavigation active={active} onSelect={setActive} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, backgroundColor: colors.bg },
  body: { ...typography.body, color: colors.textSoft },
  legacy: { minHeight: 44, padding: spacing.md, gap: spacing.xs, backgroundColor: colors.surface, borderRadius: radius.md },
  link: { ...typography.body, color: colors.text, fontWeight: '600' },
  meta: { ...typography.caption, color: colors.textMuted },
});
