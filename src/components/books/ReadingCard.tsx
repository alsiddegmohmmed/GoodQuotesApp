import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Book } from '../../data/personalLibrary';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { BookCover } from './BookCover';
import { ReadingProgress } from './ReadingProgress';

export function ReadingCard({ book, onPress }: { book: Book; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={book.title + ', ' + book.status + (book.progress === null ? '' : ', ' + book.progress + ' percent')} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <View style={styles.cover}><BookCover book={book} /></View>
    <View style={styles.info}>
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>
      {book.progress === null ? <Text style={styles.author}>{book.status}</Text> : <ReadingProgress progress={book.progress} />}
    </View>
    <Feather name="chevron-right" size={18} color={colors.textMuted} />
  </Pressable>;
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md },
  pressed: { opacity: 0.75 },
  cover: { width: 66 },
  info: { flex: 1, gap: spacing.xs },
  title: { ...typography.body, color: colors.text, fontWeight: '600' },
  author: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
});
