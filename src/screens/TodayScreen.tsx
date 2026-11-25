import { StyleSheet, Text, View } from 'react-native';
import { ReadingCard } from '../components/books/ReadingCard';
import { Screen, ScreenHeading, SectionHeading } from '../components/layout/Screen';
import { PassageCard } from '../components/quotes/PassageCard';
import { useLibrary } from '../data/LibraryProvider';
import { dailyPassage } from '../data/personalLibrary';
import { colors, spacing, typography } from '../theme/tokens';

export function TodayScreen({ onOpenBook }: { onOpenBook: (id: string) => void }) {
  const { library: { books, highlights } } = useLibrary();
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const featured = dailyPassage(highlights, now);
  const recent = [...highlights].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter(h => h.id !== featured?.id).slice(0, 5);
  const reading = books.filter(b => b.status === 'Reading');
  return <Screen>
    <View style={styles.intro}><Text style={styles.date}>{date}</Text><ScreenHeading title="Today" subtitle="A moment to reconnect with what you read." /></View>
    {featured ? <PassageCard key={featured.id} highlight={featured} featured onOpenBook={() => onOpenBook(featured.bookId)} /> : <Text style={styles.body}>Your saved passages will appear here. Add a book and capture something you want to remember.</Text>}
    {!!reading.length && <View style={styles.section}><SectionHeading title="Continue reading" />{reading.map(book => <ReadingCard key={book.id} book={book} onPress={() => onOpenBook(book.id)} />)}</View>}
    {!!recent.length && <View style={styles.section}><SectionHeading title="Recent highlights" />{recent.map(highlight => <PassageCard key={highlight.id} highlight={highlight} onOpenBook={() => onOpenBook(highlight.bookId)} />)}</View>}
  </Screen>;
}
const styles = StyleSheet.create({
  intro: { gap: spacing.sm },
  date: { ...typography.meta, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  section: { gap: spacing.sm },
  body: { ...typography.body, color: colors.textSoft },
});
