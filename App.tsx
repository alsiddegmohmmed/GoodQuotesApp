import 'react-native-gesture-handler';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LibraryProvider } from './src/data/LibraryProvider';
import { CompanionScreen } from './src/screens/CompanionScreen';
import { LibraryToolsScreen } from './src/screens/LibraryToolsScreen';
import { MainTabs } from './src/navigation/MainTabs';
import type { RootStackParamList } from './src/navigation/types';
import { BookDetailScreen } from './src/screens/BookDetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import { colors } from './src/theme/tokens';

const Stack = createStackNavigator<RootStackParamList>();
const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, text: colors.text, border: colors.line, primary: colors.accentPrimary },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <LibraryProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="BookDetail" component={BookDetailScreen} />
          <Stack.Screen name="Companion" component={CompanionScreen} options={{ headerShown: true, title: "Reading companion" }} />
          <Stack.Screen name="LibraryTools" component={LibraryToolsScreen} options={{ headerShown: true, title: "Library" }} />
          <Stack.Screen name="LegacyQuotes" component={HomeScreen} options={{ headerShown: true, title: 'Original quote feed' }} />
        </Stack.Navigator>
      </NavigationContainer>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}
