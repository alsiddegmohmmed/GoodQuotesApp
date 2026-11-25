// Explicitly synthetic reading records for UI development, not the user's library.
// Passages are from public-domain works; reading progress is illustrative.
export type ReadingStatus = 'Reading' | 'Finished' | 'Saved';
export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  color: string;
  status: ReadingStatus;
  progress: number;
  about: string;
};
export type Highlight = { id: string; bookId: string; text: string };

export const books: Book[] = [
  { id: 'pride', title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', color: '#75534E', status: 'Reading', progress: 42, about: 'A novel of manners, judgment, family and marriage in early nineteenth-century England.' },
  { id: 'moby', title: 'Moby-Dick', author: 'Herman Melville', isbn: '9780142437247', color: '#354C59', status: 'Reading', progress: 18, about: 'A voyage aboard the Pequod becomes an exploration of obsession, fate and the sea.' },
  { id: 'jane', title: 'Jane Eyre', author: 'Charlotte Brontë', isbn: '9780141439600', color: '#565342', status: 'Finished', progress: 100, about: 'A young woman searches for independence, dignity and love.' },
  { id: 'meditations', title: 'Meditations', author: 'Marcus Aurelius', isbn: '9780140449334', color: '#5C544C', status: 'Saved', progress: 0, about: 'Personal reflections on judgment, character and the conduct of life.' },
];

export const highlights: Highlight[] = [
  { id: 'h1', bookId: 'pride', text: 'I could easily forgive his pride, if he had not mortified mine.' },
  { id: 'h2', bookId: 'jane', text: 'I am no bird; and no net ensnares me: I am a free human being with an independent will.' },
  { id: 'h3', bookId: 'moby', text: 'It is not down in any map; true places never are.' },
];

export function getBook(id: string) {
  return books.find((book) => book.id === id);
}
