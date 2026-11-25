import { useState } from 'react';
import type { StackScreenProps } from '@react-navigation/stack';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNavigation } from '../components/navigation/BottomNavigation';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { colors, radius, spacing, typography } from '../theme/tokens';
import type { MainTab, RootStackParamList } from './types';

export function MainTabs({ navigation }: StackScreenProps<RootStackParamList, 'Main'>) {
  const [active, setActive] = useState<MainTab>('Today');
  const openBook = (bookId: string) => navigation.navigate('BookDetail', { bookId });
  return <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.safe}>
    <View style={styles.content}>
      {active === 'Today' ? <TodayScreen onOpenBook={openBook} /> : active === 'Library' ? <LibraryScreen onOpenBook={openBook} onAdd={() => navigation.navigate('LibraryTools', { mode: 'add' })} onImport={() => navigation.navigate('LibraryTools', { mode: 'import' })} onImportQuotes={() => navigation.navigate('LibraryTools', { mode: 'quotes' })} /> : active === 'Discover' ? <DiscoverScreen onOpenBook={openBook} onCompanion={sourceIds => navigation.navigate('Companion', { sourceIds })} /> : <ProfileScreen onLegacy={() => navigation.navigate('LegacyQuotes')} />}
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
