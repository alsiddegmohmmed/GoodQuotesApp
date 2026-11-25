import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen, ScreenHeading, SectionHeading } from '../components/layout/Screen';
import { PassageCard } from '../components/quotes/PassageCard';
import { useLibrary } from '../data/LibraryProvider';
import { recordConnection, searchPassages, suggestComparison } from '../data/connections';
import type { ConnectionRelation } from '../data/personalLibrary';
import { colors, radius, spacing, typography } from '../theme/tokens';

const relations: ConnectionRelation[] = ['Agreement', 'Contrast', 'Complement', 'Recurring question', 'Other'];
export function DiscoverScreen({ onOpenBook, onCompanion }: { onOpenBook: (id: string) => void; onCompanion: (sourceIds?: string[]) => void }) {
  const { library, saving, change } = useLibrary();
  const [query, setQuery] = useState(''), [leftId, setLeft] = useState<string | null>(null), [rightId, setRight] = useState<string | null>(null);
  const [relation, setRelation] = useState<ConnectionRelation | undefined>(), [reflection, setReflection] = useState(''), [error, setError] = useState('');
  const [limit, setLimit] = useState(20);
  const suggested = useMemo(() => suggestComparison(library), [library]);
  const found = useMemo(() => searchPassages(library, query), [library, query]);
  const left = library.highlights.find(h => h.id === leftId), right = library.highlights.find(h => h.id === rightId);
  function choose(a: string, b: string, type?: ConnectionRelation, note = '') {
    setLeft(a); setRight(b); setRelation(type); setReflection(note); setError('');
  }
  function clear() { setLeft(null); setRight(null); setRelation(undefined); setReflection(''); setError(''); }
  async function record(a: string, b: string, state: 'saved' | 'dismissed') {
    try { await change(current => recordConnection(current, a, b, state, state === 'saved' ? relation : undefined, state === 'saved' ? reflection : undefined)); clear(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save connection.'); }
  }
  return <Screen>
    <ScreenHeading title="Discover" subtitle="Ideas from different books, in conversation." />
    <Pressable style={[styles.action,styles.selected]} onPress={()=>onCompanion()}><Text style={styles.dark}>Explore with your reading companion</Text></Pressable>
    {!left && suggested && <View style={styles.panel}>
      <Text style={styles.eyebrow}>A POSSIBLE COMPARISON</Text>
      <Text style={styles.body}>These saved passages share the words {suggested.shared.join(', ')}. This is a text match, not an interpretation.</Text>
      <PassageCard highlight={suggested.left} onOpenBook={() => onOpenBook(suggested.left.bookId)} />
      <PassageCard highlight={suggested.right} onOpenBook={() => onOpenBook(suggested.right.bookId)} />
      <View style={styles.row}><Pressable style={styles.action} onPress={() => choose(suggested.left.id, suggested.right.id)}><Text style={styles.body}>Explore together</Text></Pressable><Pressable disabled={saving} style={styles.action} onPress={() => record(suggested.left.id, suggested.right.id, 'dismissed')}><Text style={styles.meta}>Dismiss</Text></Pressable></View>
    </View>}
    {!!left && <View style={styles.panel}>
      <SectionHeading title={right ? 'Compare ideas' : 'First passage'} />
      <PassageCard highlight={left} onOpenBook={() => onOpenBook(left.bookId)} />
      {right ? <>
        <PassageCard highlight={right} onOpenBook={() => onOpenBook(right.bookId)} />
        <Pressable style={styles.action} onPress={()=>onCompanion([left.id,right.id])}><Text style={styles.body}>Discuss these passages with AI</Text></Pressable>
        <Text style={styles.meta}>How do these ideas relate? Your interpretation is optional until you save a connection.</Text>
        <View style={styles.row}>{relations.map(r => <Pressable key={r} onPress={() => setRelation(r)} style={[styles.action, relation === r && styles.selected]}><Text style={relation === r ? styles.dark : styles.body}>{r}</Text></Pressable>)}</View>
        <TextInput multiline value={reflection} onChangeText={setReflection} placeholder="Your reflection or question (optional)" placeholderTextColor={colors.textMuted} style={styles.input} />
        <Pressable disabled={saving || !relation} style={[styles.action, styles.selected, !relation && { opacity: 0.5 }]} onPress={() => record(left.id, right.id, 'saved')}><Text style={styles.dark}>Save connection</Text></Pressable>
      </> : <Text style={styles.meta}>Choose a passage from a different book below.</Text>}
      <Pressable onPress={clear}><Text style={styles.meta}>Clear selection</Text></Pressable>
    </View>}
    {!!error && <Text accessibilityLiveRegion="polite" style={styles.body}>{error}</Text>}
    <SectionHeading title="Find a passage" />
    <TextInput value={query} onChangeText={v => { setQuery(v); setLimit(20); }} placeholder="Search saved words, notes, books or authors" placeholderTextColor={colors.textMuted} style={styles.input} />
    {!found.length && <Text style={styles.meta}>No matching saved passages.</Text>}
    {found.slice(0, limit).map(h => <View key={h.id} style={styles.panel}>
      <PassageCard highlight={h} onOpenBook={() => onOpenBook(h.bookId)} />
      <Pressable disabled={!!left && h.bookId === left.bookId} style={styles.action} onPress={() => {
        if (!left || right) { clear(); setLeft(h.id); } else setRight(h.id);
      }}><Text style={styles.meta}>{left?.bookId === h.bookId ? 'Same book as first passage' : left && !right ? 'Compare with first passage' : 'Select for comparison'}</Text></Pressable>
    </View>)}
    {found.length > limit && <Pressable onPress={() => setLimit(n => n + 20)} style={styles.action}><Text style={styles.body}>Show more</Text></Pressable>}
    <SectionHeading title="Your connections" />
    {(library.connections ?? []).filter(c => c.state === 'saved').map(c => {
      const a = library.highlights.find(h => h.id === c.leftId), b = library.highlights.find(h => h.id === c.rightId);
      if (!a || !b) return null;
      return <View key={JSON.stringify([c.leftId,c.rightId].sort())} style={styles.panel}>
        <Text style={styles.eyebrow}>{c.relation}</Text>
        <PassageCard highlight={a} onOpenBook={() => onOpenBook(a.bookId)} />
        <PassageCard highlight={b} onOpenBook={() => onOpenBook(b.bookId)} />
        {!!c.reflection && <Text selectable style={styles.body}>{c.reflection}</Text>}
        <Pressable style={styles.action} onPress={()=>onCompanion([a.id,b.id])}><Text style={styles.body}>Discuss this connection</Text></Pressable>
        <Pressable style={styles.action} onPress={() => choose(a.id,b.id,c.relation,c.reflection)}><Text style={styles.meta}>Edit connection</Text></Pressable>
      </View>;
    })}
    {!(library.connections ?? []).some(c => c.state === 'saved') && <Text style={styles.meta}>Your saved comparisons and reflections will appear here.</Text>}
  </Screen>;
}
const styles = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  body: { ...typography.body, color: colors.text },
  meta: { ...typography.caption, color: colors.textMuted },
  eyebrow: { ...typography.meta, color: colors.accentWarm, textTransform: 'uppercase', letterSpacing: 1 },
  input: { ...typography.body, color: colors.text, backgroundColor: colors.surface2, borderRadius: radius.md, padding: spacing.md, minHeight: 48, textAlignVertical: 'top' },
  action: { backgroundColor: colors.surface2, padding: spacing.sm, minHeight: 44, justifyContent: 'center', borderRadius: radius.sm },
  selected: { backgroundColor: colors.accentPrimary },
  dark: { ...typography.body, color: colors.bg },
});
