export type RootStackParamList = {
  Main: undefined;
  BookDetail: { bookId: string };
  LegacyQuotes: undefined;
};

export type MainTab = 'Today' | 'Library' | 'Discover' | 'Profile';
