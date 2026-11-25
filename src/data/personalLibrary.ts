export type ReadingStatus = 'Reading' | 'Finished' | 'Saved';
export type Book = {
  id: string; title: string; author: string; isbn: string; color: string;
  status: ReadingStatus; progress: number | null; about: string;
  source?: 'goodreads' | 'manual' | 'kindle' | 'readwise' | 'quote-csv'; dateRead?: string; dateAdded?: string;
  rating?: string; review?: string; privateNote?: string;
};
export type Highlight = {
  id: string; bookId: string; text: string; location?: string;
  note?: string; createdAt: string; favorite?: boolean;
  source?: 'kindle' | 'readwise' | 'quote-csv'; sourceDate?: string; sourceId?: string;
};
export type ConnectionRelation = 'Agreement' | 'Contrast' | 'Complement' | 'Recurring question' | 'Other';
export type Connection = {
  leftId: string; rightId: string; state: 'saved' | 'dismissed';
  relation?: ConnectionRelation; reflection?: string; createdAt: string;
};
export type Library = { books: Book[]; highlights: Highlight[]; connections?: Connection[] };
export const emptyLibrary: Library = { books: [], highlights: [] };

export function newId(prefix: string): string {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

export function manualBook(title: string, author: string, isbn: string): Book {
  if (!title.trim() || !author.trim()) throw new Error('Enter a title and author.');
  return { id: newId('book'), title: title.trim(), author: author.trim(),
    isbn: isbn.trim(), color: '#45464D', status: 'Saved', progress: null, about: '', source: 'manual' };
}

export function addHighlight(library: Library, bookId: string, text: string, location: string, note: string): Library {
  if (!library.books.some(b => b.id === bookId)) throw new Error('Book no longer exists.');
  if (!text.trim()) throw new Error('Enter a passage.');
  const highlight: Highlight = { id: newId('highlight'), bookId, text,
    createdAt: new Date().toISOString(), location: location.trim() || undefined,
    note: note.trim() ? note : undefined };
  return { ...library, highlights: [...library.highlights, highlight] };
}

// RFC 4180-style CSV, including multiline reviews and escaped quotes.
export function parseCSV(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false, closed = false;
  const source = input.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c === '"') {
        if (source[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else field += c;
    } else if (c === ',' || c === '\n' || c === '\r') {
      row.push(field); field = ''; closed = false;
      if (c !== ',') {
        if (c === '\r' && source[i + 1] === '\n') i++;
        if (row.some(v => v !== '')) rows.push(row);
        row = [];
      }
    } else if (c === '"' && field === '' && !closed) quoted = true;
    else {
      if (closed || c === '"') throw new Error('Malformed CSV quoting.');
      field += c;
    }
  }
  if (quoted) throw new Error('Unclosed quoted CSV field.');
  row.push(field);
  if (row.some(v => v !== '')) rows.push(row);
  return rows;
}

export function parseGoodreads(input: string): { books: Book[]; skipped: number } {
  const [header, ...rows] = parseCSV(input);
  if (!header) throw new Error('Empty Goodreads export.');
  const cols = new Map(header.map((v, i) => [v.trim(), i]));
  for (const key of ['Book Id', 'Title', 'Author', 'Exclusive Shelf']) {
    if (!cols.has(key)) throw new Error('Missing Goodreads column: ' + key);
  }
  let skipped = 0;
  const books: Book[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const get = (name: string) => row[cols.get(name) ?? -1] ?? '';
    const id = get('Book Id').trim(), title = get('Title').trim(), author = get('Author').trim();
    const shelf = get('Exclusive Shelf').trim();
    const status = shelf === 'read' ? 'Finished' : shelf === 'currently-reading' ? 'Reading' : shelf === 'to-read' ? 'Saved' : null;
    if (row.length !== header.length || !/^\d+$/.test(id) || !title || !author || !status || seen.has(id)) {
      skipped++; continue;
    }
    seen.add(id);
    const isbn = (get('ISBN13') || get('ISBN')).replace(/^="|"$/g, '').trim();
    books.push({ id: 'goodreads-' + id, title, author, isbn, color: '#45464D', status,
      progress: status === 'Finished' ? 100 : null, about: '', source: 'goodreads',
      dateRead: get('Date Read') || undefined, dateAdded: get('Date Added') || undefined,
      rating: get('My Rating') || undefined, review: get('My Review') || undefined,
      privateNote: get('Private Notes') || undefined });
  }
  return { books, skipped };
}

export function mergeBooks(library: Library, incoming: Book[]): Library {
  const seen = new Set(library.books.map(b => b.id));
  const added = incoming.filter(b => { if (seen.has(b.id)) return false; seen.add(b.id); return true; });
  return { ...library, books: [...library.books, ...added] };
}

// A deliberately simple local daily rotation; not semantic personalization.
export function dailyPassage(highlights: Highlight[], date: Date): Highlight | undefined {
  if (!highlights.length) return undefined;
  const ordered = [...highlights].sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite)
    || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return ordered[((day % ordered.length) + ordered.length) % ordered.length];
}

export function isLibrary(value: unknown): value is Library {
  if (!value || typeof value !== 'object') return false;
  const v = value as Library;
  if (!Array.isArray(v.books) || !Array.isArray(v.highlights)) return false;
  const ids = new Set<string>();
  for (const b of v.books) {
    if (!b || typeof b.id !== 'string' || ids.has(b.id) ||
      ![b.title, b.author, b.isbn, b.color, b.about].every(x => typeof x === 'string') ||
      !['Reading', 'Finished', 'Saved'].includes(b.status) ||
      !(b.progress === null || (typeof b.progress === 'number' && b.progress >= 0 && b.progress <= 100))) return false;
    if (![b.dateRead, b.dateAdded, b.rating, b.review, b.privateNote].every(x => x === undefined || typeof x === 'string')) return false;
    ids.add(b.id);
  }
  const highlightIds = new Set<string>();
  for (const h of v.highlights) {
    if (!h || typeof h.id !== 'string' || highlightIds.has(h.id) ||
      !ids.has(h.bookId) || typeof h.text !== 'string' || !h.text.trim() ||
      typeof h.createdAt !== 'string' || !Number.isFinite(Date.parse(h.createdAt)) ||
      ![h.location, h.note, h.sourceDate, h.sourceId].every(x => x === undefined || typeof x === 'string') ||
      !(h.favorite === undefined || typeof h.favorite === 'boolean') ||
      !(h.source === undefined || ['kindle', 'readwise', 'quote-csv'].includes(h.source))) return false;
    highlightIds.add(h.id);
  }
  if (v.connections !== undefined) {
    if (!Array.isArray(v.connections)) return false;
    const byId = new Map(v.highlights.map(h => [h.id, h]));
    const pairs = new Set<string>();
    for (const c of v.connections) {
      if (!c || typeof c.leftId !== 'string' || typeof c.rightId !== 'string' ||
        !byId.has(c.leftId) || !byId.has(c.rightId) ||
        byId.get(c.leftId)?.bookId === byId.get(c.rightId)?.bookId ||
        !['saved', 'dismissed'].includes(c.state) ||
        typeof c.createdAt !== 'string' || !Number.isFinite(Date.parse(c.createdAt)) ||
        (c.reflection !== undefined && typeof c.reflection !== 'string') ||
        (c.state === 'saved' && !['Agreement', 'Contrast', 'Complement', 'Recurring question', 'Other'].includes(c.relation ?? '')) ||
        (c.state === 'dismissed' && (c.relation !== undefined || c.reflection !== undefined))) return false;
      const key = JSON.stringify([c.leftId, c.rightId].sort());
      if (pairs.has(key)) return false;
      pairs.add(key);
    }
  }
  return true;
}
