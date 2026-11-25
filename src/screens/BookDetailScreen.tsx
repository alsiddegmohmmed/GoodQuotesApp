import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookCover } from '../components/books/BookCover';
import { ReadingProgress } from '../components/books/ReadingProgress';
import { Screen } from '../components/layout/Screen';
import { PassageCard } from '../components/quotes/PassageCard';
import { getBook, highlights } from '../data/preview';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';

const sections = ['Highlights', 'Notes', 'About'] as const;
type Props = StackScreenProps<RootStackParamList, 'BookDetail'>;

export function BookDetailScreen({ route, navigation }: Props) {
  const [section, setSection] = useState<(typeof sections)[number]>('Highlights');
  const book = getBook(route.params.bookId);
  const passages = highlights.filter((highlight) => highlight.bookId === route.params.bookId);
  return <SafeAreaView style={styles.root}>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.back} onPress={() => navigation.goBack()}><Feather name="arrow-left" size={23} color={colors.text} /></Pressable><Text style={styles.topLabel}>Book details</Text></View>
    <Screen>
      {!book ? <Text style={styles.body}>This book is not available.</Text> : <>
        <View style={styles.hero}>
          <View style={styles.cover}><BookCover key={book.id} book={book} /></View>
          <View style={styles.info}><Text accessibilityRole="header" style={styles.title}>{book.title}</Text><Text style={styles.body}>{book.author}</Text><Text style={styles.status}>{book.status}</Text><ReadingProgress progress={book.progress} /></View>
        </View>
        <View style={styles.tabs}>{sections.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: section === item }} onPress={() => setSection(item)} style={[styles.tab, section === item && styles.activeTab]}><Text style={[styles.tabText, section === item && styles.activeText]}>{item}</Text></Pressable>)}</View>
        {section === 'Highlights' ? <View style={styles.passages}>{passages.length ? passages.map((highlight) => <PassageCard key={highlight.id} highlight={highlight} />) : <Text style={styles.body}>No sample highlights for this book.</Text>}</View> : section === 'Notes' ? <Text style={styles.body}>No sample notes yet.</Text> : <Text style={styles.body}>{book.about}</Text>}
        <View style={styles.capture}><Text style={styles.captureTitle}>Capture a passage</Text><Text style={styles.body}>Add Highlight and Scan Page will be available when capture and persistence are connected.</Text></View>
        <Text style={styles.meta}>Design preview · Sample reading record</Text>
      </>}
    </Screen>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topLabel: { ...typography.caption, color: colors.textMuted },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cover: { width: '37%' },
  info: { flex: 1, gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  body: { ...typography.body, color: colors.textSoft },
  status: { ...typography.meta, color: colors.textSoft, alignSelf: 'flex-start', backgroundColor: colors.surface2, borderRadius: radius.pill, overflow: 'hidden', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  tabs: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.accentPrimary },
  tabText: { ...typography.caption, color: colors.textMuted },
  activeText: { color: colors.text, fontWeight: '600' },
  passages: { gap: spacing.sm },
  capture: { gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  captureTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  meta: { ...typography.meta, color: colors.textMuted },
});
