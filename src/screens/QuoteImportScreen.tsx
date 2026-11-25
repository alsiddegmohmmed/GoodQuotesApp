import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Screen, ScreenHeading } from '../components/layout/Screen';
import { useLibrary } from '../data/LibraryProvider';
import { parseKindle, parseQuoteCSV, planQuoteImport, type ImportSource, type ParsedQuotes } from '../data/quoteImport';
import { colors, spacing, radius, typography } from '../theme/tokens';

const modes: { id: ImportSource; label: string }[] = [
  { id: 'kindle', label: 'Kindle clippings' }, { id: 'readwise', label: 'Readwise CSV' }, { id: 'quote-csv', label: 'Quotes CSV' }
];
export function QuoteImportScreen({ onDone }: { onDone: () => void }) {
  const { library, saving, change } = useLibrary();
  const [source, setSource] = useState<ImportSource>('kindle');
  const [input, setInput] = useState(''), [title, setTitle] = useState(''), [author, setAuthor] = useState('');
  const [parsed, setParsed] = useState<ParsedQuotes | null>(null), [error, setError] = useState('');
  const [result, setResult] = useState('');
  const preview = parsed ? planQuoteImport(library, parsed) : null;
  function reset() { setParsed(null); setError(''); setResult(''); }
  async function save() {
    if (!parsed) return;
    try {
      let count = 0;
      await change(current => { const plan = planQuoteImport(current, parsed); count = plan.added; return plan.library; });
      setParsed(null); setInput(''); setResult(count + ' passages imported.'); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Import failed.'); }
  }
  return <Screen>
    <ScreenHeading title="Import passages" subtitle="Bring your reading memory with you." />
    <View style={styles.row}>{modes.map(m => <Pressable key={m.id} disabled={saving} onPress={() => { setSource(m.id); reset(); }} style={[styles.chip, source === m.id && styles.selected]}><Text style={[styles.body, source === m.id && styles.dark]}>{m.label}</Text></Pressable>)}</View>
    <Text style={styles.meta}>{source === 'kindle' ? 'Paste English My Clippings.txt. Separate notes and bookmarks are reported as skipped; highlight text and original location/date are preserved.' : source === 'readwise' ? 'Paste a Readwise CSV with Highlight, Book Title and Book Author columns. Notes, locations and dates are retained when present.' : 'Paste a CSV with a Quote, Text or Highlight column. For a quote-only file, enter the book and author explicitly. Split mixed-book files before importing.'}</Text>
    {source === 'quote-csv' && <><TextInput style={styles.input} value={title} onChangeText={v => { setTitle(v); reset(); }} placeholder="Book title for quote-only CSV" placeholderTextColor={colors.textMuted} /><TextInput style={styles.input} value={author} onChangeText={v => { setAuthor(v); reset(); }} placeholder="Author for quote-only CSV" placeholderTextColor={colors.textMuted} /></>}
    <Pressable style={styles.button} disabled={saving} onPress={async () => { try { setInput(await Clipboard.getStringAsync()); reset(); } catch { setError('Clipboard unavailable. Paste the text below.'); } }}><Text style={styles.dark}>Paste from clipboard</Text></Pressable>
    <TextInput accessibilityLabel="Export text" multiline autoCorrect={false} autoCapitalize="none" editable={!saving} value={input} onChangeText={v => { setInput(v); reset(); }} placeholder="Paste export text" placeholderTextColor={colors.textMuted} style={[styles.input, { minHeight: 100 }]} />
    <Pressable style={styles.button} disabled={saving || !input.trim()} onPress={() => { try { setParsed(source === 'kindle' ? parseKindle(input) : parseQuoteCSV(input, source, {title, author})); setError(''); setResult(''); } catch (e) { setParsed(null); setError(e instanceof Error ? e.message : 'Cannot parse export.'); } }}><Text style={styles.dark}>Preview import</Text></Pressable>
    {preview && <View style={styles.panel}>
      <Text style={styles.body}>{preview.added} new passages · {preview.newBooks} new books</Text>
      <Text style={styles.meta}>{preview.duplicates} duplicate · {preview.ambiguous} ambiguous book match · {preview.skipped} unsupported or invalid rows skipped</Text>
      <Text style={styles.meta}>Review title/author matches below. Existing books are matched by normalized title and author, not verified edition. Different sources are kept separate.</Text>
      {preview.matches.slice(0, 30).map(m => <Text key={JSON.stringify([m.title,m.author])} style={styles.body}>{m.title} — {m.author} · {m.count} · {m.existing ? 'Existing' : 'New'}</Text>)}
      {preview.matches.length > 30 && <Text style={styles.meta}>And {preview.matches.length - 30} more book matches.</Text>}
      <Pressable style={styles.button} disabled={saving || !preview.added} onPress={save}><Text style={styles.dark}>{saving ? 'Saving…' : 'Confirm import'}</Text></Pressable>
    </View>}
    {!!error && <Text accessibilityLiveRegion="polite" style={styles.body}>{error}</Text>}
    {!!result && <Text accessibilityLiveRegion="polite" style={styles.body}>{result}</Text>}
    <Pressable onPress={onDone}><Text style={styles.body}>Done</Text></Pressable>
  </Screen>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { backgroundColor: colors.surface2, borderRadius: radius.pill, padding: spacing.sm },
  selected: { backgroundColor: colors.accentPrimary },
  body: { ...typography.body, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted },
  dark: { ...typography.caption, color: colors.bg, fontWeight: '600' },
  input: { ...typography.body, color: colors.text, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, minHeight: 48, textAlignVertical: 'top' },
  button: { backgroundColor: colors.accentPrimary, borderRadius: radius.md, minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: spacing.sm },
  panel: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm }
});
