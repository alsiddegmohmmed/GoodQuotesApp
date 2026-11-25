import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Book } from '../../data/personalLibrary';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export function BookCover({ book }: { book: Book }) {
  const [failed, setFailed] = useState(false);
  return (
    <View accessible accessibilityLabel={book.title + ' cover'} style={[styles.cover, { backgroundColor: book.color }]}>
      {!failed && book.isbn ? <Image accessible={false} source={{ uri: 'https://covers.openlibrary.org/b/isbn/' + book.isbn + '-M.jpg?default=false' }} style={StyleSheet.absoluteFillObject} resizeMode="cover" onError={() => setFailed(true)} /> : null}
      {failed || !book.isbn ? <View style={styles.fallback}><Text style={styles.title}>{book.title}</Text><Text style={styles.author}>{book.author}</Text></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { width: '100%', aspectRatio: 2 / 3, borderRadius: radius.sm, overflow: 'hidden' },
  fallback: { flex: 1, padding: spacing.sm, justifyContent: 'space-between' },
  title: { ...typography.body, fontWeight: '600', color: colors.white },
  author: { ...typography.meta, color: colors.white },
});
