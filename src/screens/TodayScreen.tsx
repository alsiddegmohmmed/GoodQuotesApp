import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ReadingCard } from '../components/books/ReadingCard';
import { Screen, ScreenHeading, SectionHeading } from '../components/layout/Screen';
import { PassageCard } from '../components/quotes/PassageCard';
import { useLibrary } from '../data/LibraryProvider';
import { dailyPassage } from '../data/personalLibrary';
import { colors, spacing, typography } from '../theme/tokens';

export function TodayScreen({ onOpenBook, onDiscover }: { onOpenBook: (id: string) => void; onDiscover: (ids?: string[]) => void }) {
  const { library: { books, highlights } } = useLibrary();
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const featured = dailyPassage(highlights, now);
  const recent = [...highlights].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter(h => h.id !== featured?.id).slice(0, 5);
  const reading = books.filter(b => b.status === 'Reading');
  return <Screen>
    <View style={styles.intro}><Text style={styles.date}>{date}</Text><ScreenHeading title="Today" subtitle="A moment to reconnect with what you read." /></View>
    {featured ? <PassageCard key={featured.id} highlight={featured} featured onOpenBook={() => onOpenBook(featured.bookId)} /> : <Text style={styles.body}>Your saved passages will appear here. Add a book and capture something you want to remember.</Text>}
    {new Set(highlights.map(h=>h.bookId)).size>=2 && <Pressable style={styles.discovery} onPress={()=>onDiscover(featured?[featured.id]:undefined)}><Text style={styles.discoveryTitle}>Across your reading</Text><Text style={styles.body}>Explore a connection between today's passage and ideas from other books.</Text></Pressable>}
    {!!reading.length && <View style={styles.section}><SectionHeading title="Continue reading" />{reading.map(book => <ReadingCard key={book.id} book={book} onPress={() => onOpenBook(book.id)} />)}</View>}
    {!!recent.length && <View style={styles.section}><SectionHeading title="Recent highlights" />{recent.map(highlight => <PassageCard key={highlight.id} highlight={highlight} onOpenBook={() => onOpenBook(highlight.bookId)} />)}</View>}
  </Screen>;
}
const styles = StyleSheet.create({
  intro: { gap: spacing.sm },
  discovery: { padding: spacing.md, gap: spacing.xs, backgroundColor: colors.surface, borderRadius: 16 },
  discoveryTitle: { ...typography.title, color: colors.text },
  date: { ...typography.meta, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  section: { gap: spacing.sm },
  body: { ...typography.body, color: colors.textSoft },
});
