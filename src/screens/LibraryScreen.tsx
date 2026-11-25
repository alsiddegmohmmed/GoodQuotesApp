import { useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BookCover } from '../components/books/BookCover';
import { ReadingCard } from '../components/books/ReadingCard';
import { Screen, ScreenHeading } from '../components/layout/Screen';
import { books, type ReadingStatus } from '../data/preview';
import { colors, radius, spacing, typography } from '../theme/tokens';

const filters: ('All' | ReadingStatus)[] = ['All', 'Reading', 'Finished', 'Saved'];

export function LibraryScreen({ onOpenBook }: { onOpenBook: (id: string) => void }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [search, setSearch] = useState('');
  const [alphabetical, setAlphabetical] = useState(false);
  const [grid, setGrid] = useState(true);
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = books.filter((book) => (filter === 'All' || book.status === filter) && (book.title + ' ' + book.author).toLowerCase().includes(query));
    return alphabetical ? result.sort((a, b) => a.title.localeCompare(b.title)) : result;
  }, [filter, search, alphabetical]);

  return <Screen>
    <ScreenHeading title="Library" subtitle="Your books, ideas and reading history." />
    <View style={styles.search}><Feather name="search" size={18} color={colors.textMuted} /><TextInput accessibilityLabel="Search library" value={search} onChangeText={setSearch} placeholder="Search books or authors" placeholderTextColor={colors.textMuted} style={styles.input} /></View>
    <View style={styles.filters}>{filters.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.selectedFilter]}><Text style={[styles.filterText, filter === item && styles.selectedText]}>{item}</Text></Pressable>)}</View>
    <View style={styles.toolbar}><Text style={styles.meta}>{visible.length} {visible.length === 1 ? 'book' : 'books'}</Text><View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel={alphabetical ? 'Sort by collection order' : 'Sort by title'} onPress={() => setAlphabetical(!alphabetical)} style={styles.action}><Text style={styles.meta}>{alphabetical ? 'Title' : 'Collection'}</Text><Feather name="chevron-down" size={15} color={colors.textMuted} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel={grid ? 'Show list' : 'Show grid'} onPress={() => setGrid(!grid)} style={styles.action}><Feather name={grid ? 'list' : 'grid'} size={20} color={colors.textSoft} /></Pressable></View></View>
    {visible.length === 0 ? <Text style={styles.meta}>No books match this view.</Text> : grid ? <View style={styles.grid}>{visible.map((book) => <Pressable key={book.id} accessibilityRole="button" accessibilityLabel={book.title + ', ' + book.author} onPress={() => onOpenBook(book.id)} style={styles.tile}><BookCover book={book} /><Text numberOfLines={2} style={styles.title}>{book.title}</Text><Text numberOfLines={1} style={styles.meta}>{book.author}</Text></Pressable>)}</View> : <View style={styles.list}>{visible.map((book) => <ReadingCard key={book.id} book={book} onPress={() => onOpenBook(book.id)} />)}</View>}
    <Text style={styles.meta}>Design preview · Sample library</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  search: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md },
  input: { flex: 1, minHeight: 48, ...typography.body, color: colors.text },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filter: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 13, borderRadius: radius.pill, backgroundColor: colors.surface },
  selectedFilter: { backgroundColor: colors.accentPrimary },
  filterText: { ...typography.caption, color: colors.textSoft, fontWeight: '500' },
  selectedText: { color: colors.bg },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 44, minWidth: 44 },
  meta: { ...typography.caption, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '3.5%', rowGap: spacing.lg },
  tile: { width: '31%', gap: spacing.xs },
  title: { ...typography.caption, color: colors.text, fontWeight: '600' },
  list: { gap: spacing.sm },
});
