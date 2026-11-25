import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyLibrary, isLibrary, manualBook, addHighlight, mergeBooks } from '../src/data/personalLibrary.ts';
import { parseKindle, parseQuoteCSV, planQuoteImport } from '../src/data/quoteImport.ts';
import { searchPassages, suggestComparison, recordConnection } from '../src/data/connections.ts';

test('Readwise preserves note and source date, dedupes repeat imports without changing old records', () => {
 const parsed = parseQuoteCSV('Highlight,Book Title,Book Author,Note,Location,Date,Highlight ID\n"Words, exact",Book,Author,Disagree,42,unknown timezone,123', 'readwise');
 const p = planQuoteImport(emptyLibrary, parsed);
 assert.equal(p.added,1); assert.equal(p.library.highlights[0].text,'Words, exact');
 assert.equal(p.library.highlights[0].note,'Disagree'); assert.equal(p.library.highlights[0].sourceDate,'unknown timezone');
 assert.equal(planQuoteImport(p.library,parsed).duplicates,1);
 assert.ok(isLibrary(p.library));
});
test('Kindle clips preserve actual source, skip separate notes and bookmarks', () => {
 const p = parseKindle('Book (Author)\n- Your Highlight on page 4 | Added on Monday, January 1, 2024 10:00 AM\n\nOriginal words\n==========\nBook (Author)\n- Your Note on page 4 | Added on Monday\n\nMy note\n==========');
 assert.equal(p.rows.length,1); assert.equal(p.skipped,1); assert.equal(p.rows[0].location,'on page 4'); assert.equal(p.rows[0].sourceDate,'Monday, January 1, 2024 10:00 AM');
});
test('quote-only CSV requires explicit attribution and ambiguous existing titles are skipped', () => {
 const raw = 'Quote\nOriginal';
 assert.equal(parseQuoteCSV(raw,'quote-csv').skipped,1);
 const p = parseQuoteCSV(raw,'quote-csv',{title:'Book',author:'Author'});
 const a = manualBook('Book','Author',''), b = manualBook('Book','Author','');
 assert.equal(planQuoteImport(mergeBooks(emptyLibrary,[a,b]),p).ambiguous,1);
 assert.equal(planQuoteImport(mergeBooks(emptyLibrary,[a]),p).newBooks,0);
});
test('comparison has evidence, never suggests same-book pairs, dismissal persists and edits do not duplicate', () => {
 const a = manualBook('First','Author A',''), b = manualBook('Second','Author B','');
 let l = mergeBooks(emptyLibrary,[a,b]);
 l = addHighlight(l,a.id,'Concentration protects attention','','My question');
 l = addHighlight(l,b.id,'Attention and concentration matter','','');
 const pair = suggestComparison(l);
 assert.ok(pair); assert.notEqual(pair.left.bookId,pair.right.bookId);
 assert.equal(searchPassages(l,'my question').length,1);
 const saved = recordConnection(l,pair.left.id,pair.right.id,'saved','Contrast','My reflection');
 assert.ok(isLibrary(saved)); assert.equal(suggestComparison(saved),undefined);
 const edited = recordConnection(saved,pair.right.id,pair.left.id,'saved','Complement','Edited');
 assert.equal(edited.connections.length,1);
 assert.equal(edited.connections[0].reflection,'Edited');
 const dismissed = recordConnection(l,pair.left.id,pair.right.id,'dismissed');
 assert.ok(isLibrary(dismissed)); assert.equal(suggestComparison(dismissed),undefined);
 assert.throws(()=>recordConnection(l,pair.left.id,pair.left.id,'saved','Agreement'));
});
