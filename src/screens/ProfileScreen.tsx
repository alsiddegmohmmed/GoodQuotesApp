import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { exportCSV, type CsvExport } from '../data/csvExport';
import * as Sharing from 'expo-sharing';
import { useLibrary } from '../data/LibraryProvider';
import { useAuth } from '../data/AuthGate';
import { Screen, ScreenHeading } from '../components/layout/Screen';
import { colors, spacing, typography, radius } from '../theme/tokens';

export function ProfileScreen() {
  const { library,saving,refresh } = useLibrary();
  const { session,signOut }=useAuth();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function exportLibrary(kind: 'json' | CsvExport) {
    setBusy(true); setError('');
    let uri: string | undefined;
    try {
      if (!FileSystem.cacheDirectory || !(await Sharing.isAvailableAsync())) throw new Error('File sharing is not available on this device.');
      const json=kind==='json';
      uri = FileSystem.cacheDirectory + 'goodquotes-' + kind + '-' + Date.now() + (json?'.json':'.csv');
      await FileSystem.writeAsStringAsync(uri, json?JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), library }, null, 2):exportCSV(library,kind), {encoding:FileSystem.EncodingType.UTF8});
      await Sharing.shareAsync(uri, { mimeType: json?'application/json':'text/csv', UTI: json?'public.json':'public.comma-separated-values-text', dialogTitle: 'Export private reading library' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not export.'); }
    finally {
      if (uri) { try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch { setError('Temporary export could not be removed from the app cache.'); } }
      setBusy(false);
    }
  }
  return <Screen>
    <ScreenHeading title="Profile" subtitle="Your personal reading memory." />
    <Text style={styles.body}>{session.user.email}</Text>
    <Text style={styles.meta}>Your library is saved to your private cloud account.</Text>
    <Pressable style={styles.action} disabled={saving||busy} onPress={async()=>{setError('');try{await refresh();}catch(e){setError(e instanceof Error?e.message:'Refresh failed.');}}}><Text style={styles.body}>{saving?'Syncing…':'Refresh library'}</Text></Pressable>
    <Pressable style={styles.action} disabled={busy} onPress={()=>exportLibrary('json')}><Text style={styles.body}>{busy ? 'Preparing export…' : 'Export library as JSON'}</Text><Text style={styles.meta}>Includes private notes and connections. Choose where to save or share it.</Text></Pressable>
    <Pressable style={styles.action} disabled={busy} onPress={()=>exportLibrary('books')}><Text style={styles.body}>Export books as CSV</Text><Text style={styles.meta}>{library.books.length} books · Save to Files or share</Text></Pressable>
    <Pressable style={styles.action} disabled={busy} onPress={()=>exportLibrary('highlights')}><Text style={styles.body}>Export highlights as CSV</Text><Text style={styles.meta}>{library.highlights.length} highlights with book details and notes</Text></Pressable>
    {!!error && <Text accessibilityLiveRegion="polite" style={styles.meta}>{error}</Text>}
    <Pressable style={styles.action} disabled={saving||busy} onPress={async()=>{setBusy(true);setError('');try{await signOut();}catch(e){setError(e instanceof Error?e.message:'Sign out failed.');}finally{setBusy(false);}}}><Text style={styles.body}>Sign out</Text></Pressable>
  </Screen>;
}
const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.text }, meta: { ...typography.caption, color: colors.textMuted },
  action: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, gap: spacing.xs, minHeight: 48 }
});
