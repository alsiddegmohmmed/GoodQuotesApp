import { StyleSheet, Text, View } from 'react-native';
import { ReadingCard } from '../components/books/ReadingCard';
import { Screen, ScreenHeading, SectionHeading } from '../components/layout/Screen';
import { PassageCard } from '../components/quotes/PassageCard';
import { books, highlights } from '../data/preview';
import { colors, spacing, typography } from '../theme/tokens';

export function TodayScreen({ onOpenBook }: { onOpenBook: (id: string) => void }) {
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  return <Screen>
    <View style={styles.intro}><Text style={styles.date}>{date}</Text><ScreenHeading title="Today" subtitle="A moment to reconnect with what you read." /></View>
    <PassageCard highlight={highlights[0]} featured onOpenBook={() => onOpenBook(highlights[0].bookId)} />
    <View style={styles.section}><SectionHeading title="Continue reading" />{books.filter((book) => book.status === 'Reading').map((book) => <ReadingCard key={book.id} book={book} onPress={() => onOpenBook(book.id)} />)}</View>
    <View style={styles.section}><SectionHeading title="Recent highlights" />{highlights.slice(1).map((highlight) => <PassageCard key={highlight.id} highlight={highlight} onOpenBook={() => onOpenBook(highlight.bookId)} />)}</View>
    <Text style={styles.preview}>Design preview · Sample reading records</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  intro: { gap: spacing.sm },
  date: { ...typography.meta, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  section: { gap: spacing.sm },
  preview: { ...typography.meta, color: colors.textMuted, textAlign: 'center' },
});
