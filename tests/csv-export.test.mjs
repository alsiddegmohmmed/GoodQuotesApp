import test from 'node:test';
import assert from 'node:assert/strict';
import {exportCSV} from '../src/data/csvExport.ts';
import {parseCSV} from '../src/data/personalLibrary.ts';
test('exports books and highlights with attributed, escaped cells',()=>{
 const book={id:'book-1',title:'A, "book"',author:'Author',isbn:'00123',status:'Finished',progress:100,review:'line 1\nline 2'};
 const highlight={id:'h1',bookId:'book-1',text:'"Quoted",\nline two',note:'=1+1',createdAt:'2026-01-01T00:00:00Z'};
 const l={books:[book],highlights:[highlight]};
 const books=parseCSV(exportCSV(l,'books')),quotes=parseCSV(exportCSV(l,'highlights'));
 assert.equal(books[1][1],book.title);assert.equal(books[1][3],'00123');assert.equal(books[1][10],book.review);
 assert.equal(quotes[1][2],book.title);assert.equal(quotes[1][4],highlight.text);assert.equal(quotes[1][6],"'=1+1");
 assert.equal(parseCSV(exportCSV({books:[],highlights:[]},'books')).length,1);
});
