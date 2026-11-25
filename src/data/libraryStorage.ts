import * as FileSystem from 'expo-file-system';
import { emptyLibrary, isLibrary, type Library } from './personalLibrary';

type Snapshot = { version: 1; revision: number; library: Library };
function path(slot: number) {
  if (!FileSystem.documentDirectory) throw new Error('Personal storage requires the native app.');
  return FileSystem.documentDirectory + 'goodquotes-library-v1-' + slot + '.json';
}
async function read(slot: number): Promise<{ exists: boolean; snapshot?: Snapshot }> {
  const uri = path(slot);
  if (!(await FileSystem.getInfoAsync(uri)).exists) return { exists: false };
  try {
    const s = JSON.parse(await FileSystem.readAsStringAsync(uri));
    if (s.version === 1 && Number.isSafeInteger(s.revision) && s.revision >= 1 &&
      s.revision % 2 === slot && isLibrary(s.library)) return { exists: true, snapshot: s };
  } catch { /* retain invalid file for recovery */ }
  return { exists: true };
}
export async function loadLibrary(): Promise<{ snapshot: Snapshot; recovered: boolean }> {
  const slots = await Promise.all([read(0), read(1)]);
  const valid = slots.flatMap(s => s.snapshot ? [s.snapshot] : []).sort((a, b) => b.revision - a.revision);
  if (valid.length) return { snapshot: valid[0], recovered: slots.some(s => s.exists && !s.snapshot) };
  if (slots.some(s => s.exists)) throw new Error('Reading data could not be opened. Existing files have not been reset.');
  return { snapshot: { version: 1, revision: 0, library: emptyLibrary }, recovered: false };
}
export async function saveLibrary(library: Library, previousRevision: number): Promise<Snapshot> {
  if (!isLibrary(library)) throw new Error('Invalid reading data.');
  const snapshot: Snapshot = { version: 1, revision: previousRevision + 1, library };
  const uri = path(snapshot.revision % 2);
  // Write the older slot only; retain the last valid snapshot until this write verifies.
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(snapshot));
  const verified = await read(snapshot.revision % 2);
  if (!verified.snapshot || JSON.stringify(verified.snapshot) !== JSON.stringify(snapshot)) {
    throw new Error('Could not verify saved reading data.');
  }
  return snapshot;
}
