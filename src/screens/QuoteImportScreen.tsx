import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { pickImportFile } from '../data/importFile';
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
  const [file, setFile] = useState<{name:string;text:string}|null>(null), [picking,setPicking]=useState(false);
  const [title, setTitle] = useState(''), [author, setAuthor] = useState('');
  const [parsed, setParsed] = useState<ParsedQuotes | null>(null), [error, setError] = useState('');
  const [result, setResult] = useState('');
  const preview = parsed ? planQuoteImport(library, parsed) : null;
  function reset() { setParsed(null); setError(''); setResult(''); }
  function parseFile(text:string) {
    try {setParsed(source==='kindle'?parseKindle(text):parseQuoteCSV(text,source,{title,author}));setError('');setResult('');}
    catch(e){setParsed(null);setError(e instanceof Error?e.message:'Cannot parse export.');}
  }
  async function chooseFile(){
    if(picking||saving)return;
    setPicking(true);setError('');
    try{
      const picked=await pickImportFile(source==='kindle'?'txt':'csv');
      if(!picked)return;
      setFile(picked);parseFile(picked.text);
    }catch(e){setFile(null);setParsed(null);setError(e instanceof Error?e.message:'Cannot read file.');}
    finally{setPicking(false);}
  }
  async function save() {
    if (!parsed) return;
    try {
      let count = 0;
      await change(current => { const plan = planQuoteImport(current, parsed); count = plan.added; return plan.library; });
      setParsed(null); setFile(null); setResult(count + ' passages imported.'); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : 'Import failed.'); }
  }
  return <Screen>
    <ScreenHeading title="Import passages" subtitle="Bring your reading memory with you." />
    <View style={styles.row}>{modes.map(m => <Pressable key={m.id} disabled={saving||picking} onPress={() => { setSource(m.id); setFile(null); reset(); }} style={[styles.chip, source === m.id && styles.selected]}><Text style={[styles.body, source === m.id && styles.dark]}>{m.label}</Text></Pressable>)}</View>
    <Text style={styles.meta}>{source === 'kindle' ? 'Select English My Clippings.txt. Separate notes and bookmarks are reported as skipped; highlight text and original location/date are preserved.' : source === 'readwise' ? 'Select a Readwise CSV with Highlight, Book Title and Book Author columns. Notes, locations and dates are retained when present.' : 'Select a CSV with a Quote, Text or Highlight column. For a quote-only file, enter the book and author explicitly. Split mixed-book files before importing.'}</Text>
    {source === 'quote-csv' && <><TextInput style={styles.input} editable={!picking&&!saving} value={title} onChangeText={v => { setTitle(v); reset(); }} placeholder="Book title for quote-only CSV" placeholderTextColor={colors.textMuted} /><TextInput style={styles.input} editable={!picking&&!saving} value={author} onChangeText={v => { setAuthor(v); reset(); }} placeholder="Author for quote-only CSV" placeholderTextColor={colors.textMuted} /></>}
    <Pressable style={styles.button} disabled={saving||picking} onPress={chooseFile}><Text style={styles.dark}>{picking?'Opening Files…':file?'Choose another file':'Choose '+(source==='kindle'?'TXT':'CSV')+' file'}</Text></Pressable>
    {file&&<Text numberOfLines={2} style={styles.body}>{file.name}</Text>}
    {file&&!preview&&<Pressable style={styles.button} disabled={saving||picking} onPress={()=>parseFile(file.text)}><Text style={styles.dark}>Preview import</Text></Pressable>}
    {preview && <View style={styles.panel}>
      <Text style={styles.body}>{preview.added} new passages · {preview.newBooks} new books</Text>
      <Text style={styles.meta}>{preview.duplicates} duplicate · {preview.ambiguous} ambiguous book match · {preview.skipped} unsupported or invalid rows skipped</Text>
      <Text style={styles.meta}>Review title/author matches below. Existing books are matched by normalized title and author, not verified edition. Different sources are kept separate.</Text>
      {preview.matches.slice(0, 30).map(m => <Text key={JSON.stringify([m.title,m.author])} style={styles.body}>{m.title} — {m.author} · {m.count} · {m.existing ? 'Existing' : 'New'}</Text>)}
      {preview.matches.length > 30 && <Text style={styles.meta}>And {preview.matches.length - 30} more book matches.</Text>}
      <Pressable style={styles.button} disabled={saving || picking || !preview.added} onPress={save}><Text style={styles.dark}>{saving ? 'Saving…' : 'Confirm import'}</Text></Pressable>
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
