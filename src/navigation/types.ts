export type RootStackParamList = {
  Main: undefined;
  BookDetail: { bookId: string };
  LegacyQuotes: undefined;
  Companion: { sourceIds?: string[] } | undefined;
  LibraryTools: { mode: 'add' | 'import' | 'quotes' };
};

export type MainTab = 'Today' | 'Library' | 'Discover' | 'Profile';
