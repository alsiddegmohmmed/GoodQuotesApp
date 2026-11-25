import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { loadLibrary, saveLibrary } from './libraryStorage';
import { emptyLibrary, type Library } from './personalLibrary';
import { colors, spacing, typography } from '../theme/tokens';

type Context = { library: Library; saving: boolean; change: (fn: (current: Library) => Library) => Promise<void> };
const LibraryContext = createContext<Context | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState(emptyLibrary);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [recovered, setRecovered] = useState(false);
  const [saving, setSaving] = useState(false);
  const state = useRef({ library: emptyLibrary, revision: 0 });
  const busy = useRef(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    loadLibrary().then(({ snapshot, recovered: restored }) => {
      if (!active) return;
      state.current = snapshot;
      setLibrary(snapshot.library); setRecovered(restored); setStatus('ready');
    }).catch(e => {
      if (active) { setError(e instanceof Error ? e.message : 'Could not open library.'); setStatus('error'); }
    });
    return () => { active = false; };
  }, [attempt]);
  async function change(fn: (current: Library) => Library) {
    if (busy.current) throw new Error('A save is in progress. Try again.');
    busy.current = true; setSaving(true);
    try {
      const next = fn(state.current.library);
      const snapshot = await saveLibrary(next, state.current.revision);
      state.current = snapshot; setLibrary(snapshot.library); setRecovered(false);
    } finally { busy.current = false; setSaving(false); }
  }
  if (status !== 'ready') return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: spacing.lg, gap: spacing.md }}>
    {status === 'loading' ? <ActivityIndicator color={colors.text} /> : <>
      <Text style={{ ...typography.body, color: colors.text }}>{error}</Text>
      <Pressable onPress={() => { setStatus('loading'); setAttempt(n => n + 1); }}><Text style={{ color: colors.accentPrimary }}>Retry</Text></Pressable>
    </>}
  </View>;
  return <LibraryContext.Provider value={{ library, saving, change }}>
    {recovered && <View style={{ padding: spacing.sm, backgroundColor: colors.surface2 }}><Text style={{ ...typography.caption, color: colors.text }}>Recovered the previous valid local library. A newer snapshot may have been lost.</Text></View>}
    {children}
  </LibraryContext.Provider>;
}
export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('LibraryProvider is required.');
  return context;
}
