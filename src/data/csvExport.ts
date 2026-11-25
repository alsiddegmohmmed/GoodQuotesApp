import type { Library } from './personalLibrary';

export type CsvExport = 'books' | 'highlights';
// Protect spreadsheet users from formula execution. JSON remains the lossless export.
function cell(value:unknown):string {
  let text=value==null?'':String(value);
  if(/^[\s\uFEFF]*[=+\-@]/u.test(text)||/^[\t\r\n]/.test(text))text="'"+text;
  return '"'+text.replace(/"/g,'""')+'"';
}
function csv(rows:unknown[][]):string {
  return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
export function exportCSV(library:Library,kind:CsvExport):string {
  if(kind==='books'){
    return csv([['ID','Title','Author','ISBN','Status','Progress','Source','Date Read','Date Added','My Rating','My Review','Private Notes','About'],
      ...library.books.map(b=>[b.id,b.title,b.author,b.isbn,b.status,b.progress,b.source,b.dateRead,b.dateAdded,b.rating,b.review,b.privateNote,b.about])]);
  }
  const books=new Map(library.books.map(b=>[b.id,b]));
  return csv([['Highlight ID','Book ID','Book Title','Book Author','Highlight','Location','Note','Created At','Source','Source Date','Source ID','Favorite'],
    ...library.highlights.map(h=>{const b=books.get(h.bookId);return [h.id,h.bookId,b?.title,b?.author,h.text,h.location,h.note,h.createdAt,h.source,h.sourceDate,h.sourceId,!!h.favorite];})]);
}
