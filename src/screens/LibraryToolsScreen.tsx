import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { StackScreenProps } from '@react-navigation/stack';
import { Screen, ScreenHeading } from '../components/layout/Screen';
import { useLibrary } from '../data/LibraryProvider';
import { manualBook, mergeBooks, parseGoodreads } from '../data/personalLibrary';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing, typography } from '../theme/tokens';

export function LibraryToolsScreen({ route, navigation }: StackScreenProps<RootStackParamList, 'LibraryTools'>) {
  const { library, change, saving } = useLibrary();
  const [title, setTitle] = useState(''), [author, setAuthor] = useState(''), [isbn, setIsbn] = useState('');
  const [csv, setCsv] = useState(''), [error, setError] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof parseGoodreads> | null>(null);
  const importing = route.params.mode === 'import';
  async function add() {
    try {
      const book = manualBook(title, author, isbn);
      await change(current => mergeBooks(current, [book]));
      navigation.replace('BookDetail', { bookId: book.id });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save.'); }
  }
  async function commitImport() {
    if (!preview) return;
    try {
      await change(current => mergeBooks(current, preview.books));
      navigation.goBack();
    } catch (e) { setError(e instanceof Error ? e.message : 'Import failed.'); }
  }
  return <Screen>
    <ScreenHeading title={importing ? 'Import Goodreads' : 'Add a book'} />
    {importing ? <>
      <Text style={styles.body}>Paste your exported Goodreads CSV. It stays on this device. Review the counts before importing.</Text>
      <Pressable style={styles.button} onPress={async () => {
        try { setCsv(await Clipboard.getStringAsync()); setPreview(null); setError(''); }
        catch { setError('Could not read clipboard. Paste into the field instead.'); }
      }}><Text style={styles.buttonText}>Paste CSV from clipboard</Text></Pressable>
      <TextInput accessibilityLabel="Goodreads CSV" multiline autoCapitalize="none" autoCorrect={false} value={csv} onChangeText={v => { setCsv(v); setPreview(null); setError(''); }} placeholder="Paste CSV text" placeholderTextColor={colors.textMuted} style={[styles.input, { minHeight: 100 }]} />
      <Pressable style={styles.button} disabled={saving} onPress={() => {
        try { setPreview(parseGoodreads(csv)); setError(''); }
        catch (e) { setPreview(null); setError(e instanceof Error ? e.message : 'Invalid CSV.'); }
      }}><Text style={styles.buttonText}>Preview import</Text></Pressable>
      {preview && <>
        <Text style={styles.body}>{preview.books.filter(b => !library.books.some(x => x.id === b.id)).length} new books · {preview.books.filter(b => library.books.some(x => x.id === b.id)).length} already imported · {preview.skipped} skipped rows. Existing records will not be overwritten.</Text>
        <Pressable style={styles.button} disabled={saving || !preview.books.length} onPress={commitImport}><Text style={styles.buttonText}>{saving ? 'Saving…' : 'Import books'}</Text></Pressable>
      </>}
    </> : <>
      <TextInput accessibilityLabel="Title" value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={colors.textMuted} style={styles.input} />
      <TextInput accessibilityLabel="Author" value={author} onChangeText={setAuthor} placeholder="Author" placeholderTextColor={colors.textMuted} style={styles.input} />
      <TextInput accessibilityLabel="ISBN (optional)" value={isbn} onChangeText={setIsbn} placeholder="ISBN (optional)" placeholderTextColor={colors.textMuted} style={styles.input} />
      <Pressable style={styles.button} disabled={saving} onPress={add}><Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save book'}</Text></Pressable>
    </>}
    {!!error && <Text accessibilityLiveRegion="polite" style={styles.body}>{error}</Text>}
    <Pressable onPress={() => navigation.goBack()}><Text style={styles.body}>Cancel</Text></Pressable>
  </Screen>;
}
const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.textSoft },
  input: { ...typography.body, color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, minHeight: 48, textAlignVertical: 'top' },
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md, backgroundColor: colors.accentPrimary, padding: spacing.sm },
  buttonText: { ...typography.body, fontWeight: '600', color: colors.bg },
});
