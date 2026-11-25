import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookCover } from '../components/books/BookCover';
import { ReadingProgress } from '../components/books/ReadingProgress';
import { Screen } from '../components/layout/Screen';
import { PassageCard } from '../components/quotes/PassageCard';
import { useLibrary } from '../data/LibraryProvider';
import { addHighlight, type ReadingStatus } from '../data/personalLibrary';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';

const sections = ['Highlights', 'Notes', 'About'] as const;
type Props = StackScreenProps<RootStackParamList, 'BookDetail'>;

export function BookDetailScreen({ route, navigation }: Props) {
  const [section, setSection] = useState<(typeof sections)[number]>('Highlights');
  const { library, change, saving } = useLibrary();
  const book = library.books.find(b => b.id === route.params.bookId);
  const passages = library.highlights.filter(h => h.bookId === route.params.bookId);
  const [capturing, setCapturing] = useState(false);
  const [text, setText] = useState(''), [location, setLocation] = useState(''), [note, setNote] = useState(''), [error, setError] = useState('');
  async function save() {
    try { await change(current => addHighlight(current, route.params.bookId, text, location, note)); setText(''); setLocation(''); setNote(''); setCapturing(false); setSection('Highlights'); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); }
  }
  async function setStatus(status: ReadingStatus) {
    try { await change(current => ({ ...current, books: current.books.map(b => b.id === route.params.bookId ? { ...b, status, progress: status === 'Finished' ? 100 : null } : b) })); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save status.'); }
  }
  return <SafeAreaView style={styles.root}>
    <View style={styles.top}><Pressable accessibilityRole="button" accessibilityLabel="Go back" style={styles.back} onPress={() => navigation.goBack()}><Feather name="arrow-left" size={23} color={colors.text} /></Pressable><Text style={styles.topLabel}>Book details</Text></View>
    <Screen>
      {!book ? <Text style={styles.body}>This book is not available.</Text> : <>
        <View style={styles.hero}>
          <View style={styles.cover}><BookCover key={book.id} book={book} /></View>
          <View style={styles.info}><Text accessibilityRole="header" style={styles.title}>{book.title}</Text><Text style={styles.body}>{book.author}</Text><Text style={styles.status}>{book.status}</Text>{book.progress !== null && <ReadingProgress progress={book.progress} />}</View>
        </View>
        <View style={styles.tabs}>{(["Reading", "Finished", "Saved"] as const).map(status => <Pressable key={status} disabled={saving || book.status === status} onPress={() => setStatus(status)} style={styles.tab}><Text style={[styles.tabText, book.status === status && styles.activeText]}>{status}</Text></Pressable>)}</View>
        <View style={styles.tabs}>{sections.map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: section === item }} onPress={() => setSection(item)} style={[styles.tab, section === item && styles.activeTab]}><Text style={[styles.tabText, section === item && styles.activeText]}>{item}</Text></Pressable>)}</View>
        {section === 'Highlights' ? <View style={styles.passages}>{passages.length ? passages.map((highlight) => <PassageCard key={highlight.id} highlight={highlight} />) : <Text style={styles.body}>No saved passages for this book yet.</Text>}</View> : section === 'Notes' ? <View style={styles.passages}>{book.review ? <><Text style={styles.captureTitle}>Imported review</Text><Text selectable style={styles.body}>{book.review}</Text></> : null}{book.privateNote ? <><Text style={styles.captureTitle}>Imported private note</Text><Text selectable style={styles.body}>{book.privateNote}</Text></> : null}{passages.filter(h => h.note).map(h => <PassageCard key={h.id} highlight={h} />)}{!book.review && !book.privateNote && !passages.some(h => h.note) && <Text style={styles.body}>No notes yet.</Text>}</View> : <View style={styles.passages}><Text style={styles.body}>{book.about || 'No description saved.'}</Text>{book.dateRead ? <Text style={styles.meta}>Date read: {book.dateRead}</Text> : null}{book.dateAdded ? <Text style={styles.meta}>Date added: {book.dateAdded}</Text> : null}</View>}
        <View style={styles.capture}><Pressable accessibilityRole="button" onPress={() => setCapturing(v => !v)}><Text style={styles.captureTitle}>{capturing ? "Cancel capture" : "Add highlight"}</Text></Pressable>{capturing && <><TextInput accessibilityLabel="Passage" multiline scrollEnabled value={text} onChangeText={setText} placeholder="Author’s words" placeholderTextColor={colors.textMuted} style={[styles.input, {height:120,maxHeight:120,textAlignVertical:'top'}]} /><TextInput accessibilityLabel="Page or location" value={location} onChangeText={setLocation} placeholder="Page or location (optional)" placeholderTextColor={colors.textMuted} style={styles.input} /><TextInput accessibilityLabel="Your own note" multiline scrollEnabled value={note} onChangeText={setNote} placeholder="Your own thought (optional)" placeholderTextColor={colors.textMuted} style={[styles.input, {height:120,maxHeight:120,textAlignVertical:'top'}]} /><Pressable disabled={saving || !text.trim()} onPress={save} style={styles.save}><Text style={styles.saveText}>{saving ? "Saving…" : "Save passage"}</Text></Pressable></>}</View>
        {!!error && <Text accessibilityLiveRegion="polite" style={styles.body}>{error}</Text>}
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
  input: { ...typography.body, color: colors.text, backgroundColor: colors.surface2, borderRadius: radius.sm, padding: spacing.sm, minHeight: 48, textAlignVertical: 'top' },
  save: { backgroundColor: colors.accentPrimary, borderRadius: radius.sm, padding: spacing.md, alignItems: 'center' },
  saveText: { ...typography.body, fontWeight: '600', color: colors.bg },
  meta: { ...typography.meta, color: colors.textMuted },
});
