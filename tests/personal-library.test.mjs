import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV, parseGoodreads, mergeBooks, manualBook, addHighlight, dailyPassage, isLibrary, emptyLibrary } from '../src/data/personalLibrary.ts';
test('CSV supports quoted commas, doubled quotes, BOM and newlines', () => {
  assert.deepEqual(parseCSV('\uFEFFa,b\r\n"hello, world","line\n""quoted"""\r\n'), [['a','b'], ['hello, world','line\n"quoted"']]);
  assert.throws(() => parseCSV('a,"unfinished'));
});
test('Goodreads preserves source and avoids duplicate reimports', () => {
  const p = parseGoodreads('Book Id,Title,Author,Exclusive Shelf,Date Read,My Review\n1,Title,Author,read,2020/01/01,"I disagree"\n2,Other,Author,to-read,,');
  assert.equal(p.books.length, 2);
  assert.equal(p.books[0].review, 'I disagree');
  assert.equal(p.books[0].dateRead, '2020/01/01');
  assert.equal(p.books[1].progress, null);
  const l = mergeBooks(emptyLibrary, p.books);
  assert.deepEqual(mergeBooks(l, p.books), l);
  assert.equal(parseGoodreads('Book Id,Title,Author,Exclusive Shelf\n3,B,A,unknown').skipped, 1);
});
test('capture preserves source wording and separate note; no orphan highlights', () => {
  const b = manualBook('Book', 'Author', '');
  const l = addHighlight(mergeBooks(emptyLibrary, [b]), b.id, '  Exact wording  ', 'p. 3', 'My note');
  assert.equal(l.highlights[0].text, '  Exact wording  ');
  assert.equal(l.highlights[0].note, 'My note');
  assert.ok(isLibrary(l));
  assert.throws(() => addHighlight(l, 'missing', 'text', '', ''));
  assert.throws(() => addHighlight(l, b.id, ' ', '', ''));
  assert.equal(dailyPassage(l.highlights, new Date(2026,10,25))?.id, l.highlights[0].id);
  assert.equal(dailyPassage([], new Date()), undefined);
  assert.equal(isLibrary({ books: [], highlights: l.highlights }), false);
});
