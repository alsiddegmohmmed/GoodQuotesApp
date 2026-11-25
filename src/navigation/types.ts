export type RootStackParamList = {
  Main: undefined;
  BookDetail: { bookId: string };
  LegacyQuotes: undefined;
  LibraryTools: { mode: 'add' | 'import' };
};

export type MainTab = 'Today' | 'Library' | 'Discover' | 'Profile';
