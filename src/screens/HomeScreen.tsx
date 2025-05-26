import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { fetchQuotesWithCovers } from '../api/quoteApi'; 
interface Quote {
  Quote: string;
  bookTitle: string;
  Author: string;
  cover: string | null; // Added for book cover
}

const HomeScreen: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getQuotes = async () => {
      try {
        const data = await fetchQuotesWithCovers(); // Fetch quotes with book covers
        setQuotes(data);
      } catch (err) {
        setError('Failed to load quotes');
      } finally {
        setLoading(false);
      }
    };

    getQuotes();
  }, []);

  const copyToClipboard = async (quote: string) => {
    await Clipboard.setStringAsync(quote);
    Alert.alert('Copied to Clipboard', 'The quote has been copied successfully.');
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Latest Picks Section */}
      <View>
        <Text style={styles.sectionTitle}>Latest Picks</Text>
        <FlatList
          horizontal
          data={quotes.slice(0, 5)} // Show the first 5 quotes in "Latest Picks"
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.bookCard}>
              {item.cover ? (
                <Image source={{ uri: item.cover }} style={styles.bookImage} />
              ) : (
                <View style={styles.placeholderCover}>
                  <Text style={styles.placeholderText}>No Cover</Text>
                </View>
              )}
              <Text style={styles.bookTitle}>{item.bookTitle}</Text>
              <Text style={styles.bookAuthor}>{item.Author}</Text>
            </View>
          )}
        />
      </View>

      {/* My Quotes Section */}
      <View>
        <Text style={styles.sectionTitle}>My Quotes</Text>
        {quotes.map((item, index) => (
          <View key={index} style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{item.Quote}"</Text>
            <Text style={styles.bookText}>— {item.bookTitle} by {item.Author}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(item.Quote)}
            >
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212', // Dark background for Figma-like design
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  bookCard: {
    backgroundColor: '#333',
    marginRight: 15,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: 120,
  },
  bookImage: {
    width: 100,
    height: 150,
    borderRadius: 5,
  },
  placeholderCover: {
    width: 100,
    height: 150,
    borderRadius: 5,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
    textAlign: 'center',
  },
  bookAuthor: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  quoteCard: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  quoteText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  bookText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  copyButton: {
    marginTop: 10,
    backgroundColor: '#0E79B2',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default HomeScreen;
