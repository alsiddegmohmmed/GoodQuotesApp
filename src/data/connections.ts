import type { Connection, ConnectionRelation, Highlight, Library } from './personalLibrary';

const stop = new Set('about after again also always among another because before being between could does each every first from have here into itself just like made many might more most much must never only other over same should some such than that their them then there these they thing things this those through time upon very want were what when where which while will with would your'.split(' '));
export function words(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter(w => w.length >= 4 && !stop.has(w) && !/^\d+$/.test(w)));
}
function pairKey(a: string, b: string) { return JSON.stringify([a, b].sort()); }
export function searchPassages(library: Library, query: string): Highlight[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...library.highlights].reverse();
  const books = new Map(library.books.map(b => [b.id, b]));
  const tokens = q.split(/\s+/);
  return library.highlights.filter(h => {
    const b = books.get(h.bookId);
    const haystack = [h.text, h.note, b?.title, b?.author, h.location].join(' ').toLowerCase();
    return tokens.every(t => haystack.includes(t));
  });
}

// Lexical retrieval only. Shared words are a reason to compare, not evidence of agreement or meaning.
export function suggestComparison(library: Library): { left: Highlight; right: Highlight; shared: string[] } | undefined {
  const prior = new Set((library.connections ?? []).map(c => pairKey(c.leftId, c.rightId)));
  const newest = [...library.highlights].reverse();
  const anchors = [...newest.filter(h => h.favorite), ...newest.filter(h => !h.favorite)].slice(0, 12);
  const indexed = newest.map(h => ({ h, terms: words(h.text + ' ' + (h.note ?? '')) }));
  const frequency = new Map<string, number>();
  for (const item of indexed) for (const w of item.terms) frequency.set(w, (frequency.get(w) ?? 0) + 1);
  let best: { left: Highlight; right: Highlight; shared: string[]; score: number } | undefined;
  for (const left of anchors) {
    const a = words(left.text + ' ' + (left.note ?? ''));
    for (const {h: right, terms} of indexed) {
      if (left.bookId === right.bookId || prior.has(pairKey(left.id, right.id))) continue;
      const shared = [...a].filter(w => terms.has(w)).sort((x,y) => (frequency.get(x) ?? 0) - (frequency.get(y) ?? 0));
      if (shared.length < 2) continue;
      const score = shared.reduce((sum, w) => sum + 1 / (frequency.get(w) ?? 1), 0) / Math.sqrt(Math.max(a.size, terms.size, 1));
      if (!best || score > best.score) best = { left, right, shared: shared.slice(0, 5), score };
    }
  }
  return best && { left: best.left, right: best.right, shared: best.shared };
}

export function recordConnection(library: Library, leftId: string, rightId: string, state: 'saved' | 'dismissed', relation?: ConnectionRelation, reflection?: string): Library {
  const a = library.highlights.find(h => h.id === leftId), b = library.highlights.find(h => h.id === rightId);
  if (!a || !b || a.bookId === b.bookId) throw new Error('Choose two passages from different books.');
  if (state === 'saved' && !relation) throw new Error('Choose how the ideas relate.');
  const key = pairKey(leftId, rightId);
  const old = (library.connections ?? []).find(c => pairKey(c.leftId, c.rightId) === key);
  const connection: Connection = { leftId, rightId, state, createdAt: old?.createdAt ?? new Date().toISOString(),
    ...(state === 'saved' ? { relation, reflection: reflection?.trim() ? reflection : undefined } : {}) };
  return { ...library, connections: [...(library.connections ?? []).filter(c => pairKey(c.leftId, c.rightId) !== key), connection] };
}
