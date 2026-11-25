import { manualBook, newId, parseCSV, type Book, type Highlight, type Library } from './personalLibrary.ts';

export type ImportSource = 'kindle' | 'readwise' | 'quote-csv';
type ImportedQuote = { title: string; author: string; text: string; note?: string; location?: string; sourceDate?: string; sourceId?: string };
export type ParsedQuotes = { source: ImportSource; rows: ImportedQuote[]; skipped: number };
const clean = (v: string) => v.trim().replace(/\s+/g, ' ').toLowerCase();
const bookKey = (title: string, author: string) => JSON.stringify([clean(title), clean(author)]);
const optional = (v: string) => v.trim() ? v : undefined;

export function parseQuoteCSV(input: string, source: 'readwise' | 'quote-csv', fallback?: {title: string; author: string}): ParsedQuotes {
  const [header, ...records] = parseCSV(input);
  if (!header) throw new Error('Empty CSV.');
  const keys = header.map(v => clean(v));
  const col = (...names: string[]) => names.map(n => keys.indexOf(n)).find(i => i >= 0) ?? -1;
  const quote = col('highlight', 'quote', 'text'), title = col('book title', 'title', 'book'), author = col('book author', 'author');
  if (quote < 0) throw new Error('Expected a Highlight, Quote or Text column.');
  if (source === 'readwise' && (title < 0 || author < 0)) throw new Error('Readwise CSV must include book title and author columns.');
  const rows: ImportedQuote[] = [];
  let skipped = 0;
  for (const record of records) {
    const get = (i: number) => record[i] ?? '';
    // Explicit attribution is required for quote-only CSV; never fill a missing field in a partially attributed row.
    const rowTitle = get(title).trim(), rowAuthor = get(author).trim();
    const t = rowTitle || (!rowAuthor && title < 0 && author < 0 ? fallback?.title.trim() : '');
    const a = rowAuthor || (!rowTitle && title < 0 && author < 0 ? fallback?.author.trim() : '');
    const text = get(quote);
    if (record.length !== header.length || !t || !a || !text.trim()) { skipped++; continue; }
    rows.push({ title: t, author: a, text, note: optional(get(col('note', 'notes'))),
      location: optional(get(col('location', 'page', 'page number'))),
      sourceDate: optional(get(col('date', 'highlighted at', 'highlight date', 'created at'))),
      sourceId: optional(get(col('highlight id', 'id'))) });
  }
  return { source, rows, skipped };
}

export function parseKindle(input: string): ParsedQuotes {
  const rows: ImportedQuote[] = [];
  let skipped = 0;
  const normalized = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  for (const block of normalized.split(/^==========\s*$/m)) {
    const lines = block.replace(/^\n+|\n+$/g, '').split('\n');
    if (lines.every(l => !l.trim())) continue;
    const heading = lines[0]?.match(/^(.+)\s+\(([^()]+)\)\s*$/);
    const meta = lines[1] ?? '';
    // English My Clippings format. Do not attach separate notes/bookmarks by guessing.
    if (!heading || !/^\s*-\s+Your Highlight\b/i.test(meta)) { skipped++; continue; }
    const text = lines.slice(2).join('\n').replace(/^\n+|\n+$/g, '');
    if (!heading[1].trim() || !heading[2].trim() || !text.trim()) { skipped++; continue; }
    const parts = meta.split('|');
    const location = parts[0].replace(/^\s*-\s+Your Highlight\s*/i, '').trim();
    const rawDate = parts.slice(1).join('|').replace(/^\s*Added on\s*/i, '').trim();
    rows.push({ title: heading[1].trim(), author: heading[2].trim(), text,
      location: optional(location), sourceDate: optional(rawDate) });
  }
  return { source: 'kindle', rows, skipped };
}

const signature = (h: Highlight) => JSON.stringify([h.bookId, h.source, h.sourceId ?? '', h.text, h.location ?? '', h.note ?? '', h.sourceDate ?? '']);
export function planQuoteImport(library: Library, parsed: ParsedQuotes) {
  const books = [...library.books], highlights = [...library.highlights];
  const catalog = new Map<string, Book[]>();
  for (const b of books) {
    const key = bookKey(b.title, b.author);
    catalog.set(key, [...(catalog.get(key) ?? []), b]);
  }
  const seen = new Set(highlights.map(signature));
  const existingIds = new Set(highlights.filter(h => h.sourceId).map(h => JSON.stringify([h.source, h.sourceId])));
  let added = 0, duplicates = 0, ambiguous = 0, newBooks = 0;
  const matched = new Map<string, { title: string; author: string; count: number; existing: boolean }>();
  for (const row of parsed.rows) {
    const key = bookKey(row.title, row.author);
    const matches = catalog.get(key) ?? [];
    if (matches.length > 1) { ambiguous++; continue; }
    const externalId = row.sourceId ? JSON.stringify([parsed.source, row.sourceId]) : undefined;
    if (externalId && existingIds.has(externalId)) { duplicates++; continue; }
    let book = matches[0];
    const existing = !!book && library.books.some(b => b.id === book.id);
    if (!book) {
      book = { ...manualBook(row.title, row.author, ''), source: parsed.source };
      books.push(book); catalog.set(key, [book]); newBooks++;
    }
    const h: Highlight = { id: newId('highlight'), bookId: book.id, text: row.text, note: row.note,
      location: row.location, createdAt: new Date().toISOString(), source: parsed.source,
      sourceDate: row.sourceDate, sourceId: row.sourceId };
    const sig = signature(h);
    if (seen.has(sig)) { duplicates++; continue; }
    seen.add(sig);
    if (externalId) existingIds.add(externalId);
    highlights.push(h); added++;
    const summary = matched.get(key);
    matched.set(key, { title: book.title, author: book.author, count: (summary?.count ?? 0) + 1, existing });
  }
  return { library: { ...library, books, highlights }, added, duplicates, ambiguous, newBooks, skipped: parsed.skipped, matches: [...matched.values()] };
}
