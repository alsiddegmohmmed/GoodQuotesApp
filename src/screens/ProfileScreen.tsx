import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLibrary } from '../data/LibraryProvider';
import { Screen, ScreenHeading } from '../components/layout/Screen';
import { colors, spacing, typography, radius } from '../theme/tokens';

export function ProfileScreen({ onLegacy }: { onLegacy: () => void }) {
  const { library } = useLibrary();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function exportLibrary() {
    setBusy(true); setError('');
    let uri: string | undefined;
    try {
      if (!FileSystem.cacheDirectory || !(await Sharing.isAvailableAsync())) throw new Error('File sharing is not available on this device.');
      uri = FileSystem.cacheDirectory + 'goodquotes-export-' + Date.now() + '.json';
      await FileSystem.writeAsStringAsync(uri, JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), library }, null, 2));
      await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Export private reading library' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not export.'); }
    finally {
      if (uri) { try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch { setError('Temporary export could not be removed from the app cache.'); } }
      setBusy(false);
    }
  }
  return <Screen>
    <ScreenHeading title="Profile" subtitle="Your personal reading memory." />
    <Text style={styles.body}>Your library is stored on this device. Export a copy before uninstalling or changing phones.</Text>
    <Pressable style={styles.action} disabled={busy} onPress={exportLibrary}><Text style={styles.body}>{busy ? 'Preparing export…' : 'Export library as JSON'}</Text><Text style={styles.meta}>Includes private notes and connections. Choose where to save or share it.</Text></Pressable>
    {!!error && <Text accessibilityLiveRegion="polite" style={styles.meta}>{error}</Text>}
    <Pressable style={styles.action} onPress={onLegacy}><Text style={styles.body}>Open original quote feed</Text><Text style={styles.meta}>Separate public collection; requires the old backend.</Text></Pressable>
  </Screen>;
}
const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.text }, meta: { ...typography.caption, color: colors.textMuted },
  action: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, gap: spacing.xs, minHeight: 48 }
});
