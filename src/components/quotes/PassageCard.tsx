import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { getBook, type Highlight } from '../../data/preview';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export function PassageCard({ highlight, featured = false, onOpenBook }: { highlight: Highlight; featured?: boolean; onOpenBook?: () => void }) {
  const book = getBook(highlight.bookId);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  async function copy() {
    try {
      await Clipboard.setStringAsync(highlight.text);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }
  return <View style={[styles.card, featured && styles.featured]}>
    {featured ? <Text style={styles.eyebrow}>A PASSAGE FOR TODAY</Text> : null}
    <Text selectable style={[styles.passage, featured && styles.largePassage]}>“{highlight.text}”</Text>
    <View style={styles.footer}>
      {onOpenBook ? <Pressable accessibilityRole="button" accessibilityLabel={'Open ' + (book?.title ?? 'book')} onPress={onOpenBook} style={styles.source}>
        <Text style={styles.book}>{book?.title ?? 'Unknown book'}</Text><Text style={styles.author}>{book?.author}</Text>
      </Pressable> : <View style={styles.source}><Text style={styles.book}>{book?.title ?? 'Unknown book'}</Text><Text style={styles.author}>{book?.author}</Text></View>}
      <Pressable accessibilityRole="button" accessibilityLabel="Copy passage" onPress={copy} style={styles.copy}><Feather name={copyStatus === 'copied' ? 'check' : 'copy'} size={19} color={colors.textSoft} /></Pressable>
    </View>
    {copyStatus !== 'idle' ? <Text accessibilityLiveRegion="polite" style={styles.author}>{copyStatus === 'copied' ? 'Copied to clipboard' : 'Could not copy passage. Try again.'}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  featured: { backgroundColor: colors.surface2, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.lg, borderWidth: 1, borderColor: colors.line },
  eyebrow: { ...typography.meta, color: colors.textMuted, letterSpacing: 1.2 },
  passage: { fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }), fontSize: 19, lineHeight: 29, color: colors.text },
  largePassage: { fontSize: 27, lineHeight: 38 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  source: { flex: 1, minHeight: 44, justifyContent: 'center' },
  book: { ...typography.caption, color: colors.textSoft, fontWeight: '600' },
  author: { ...typography.meta, color: colors.textMuted },
  copy: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface3, borderRadius: radius.pill },
});
