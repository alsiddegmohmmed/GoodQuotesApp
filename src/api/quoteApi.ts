import axios from 'axios';
import { fetchBookCover } from './bookApi';

const BASE_URL = 'http://192.168.24.206:5000/api';
const API_KEY = 'AIzaSyC5aJC1Ts8N_MbmaFC_YL-ADi4biKve5lg';
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';




const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchQuotesWithCovers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/quotes`);
    const quotes = response.data;

    // Create a single query string for all book titles
    const query = quotes.map((quote: any) => `"${quote.bookTitle}"`).join(' OR ');

    // Fetch all covers in a single request
    const booksResponse = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: query,
        maxResults: quotes.length, // Fetch enough results for all quotes
        key: API_KEY,
      },
    });

    const books = booksResponse.data.items || [];

    // Map covers to quotes
    const quotesWithCovers = quotes.map((quote: any) => {
      const book = books.find((b: any) =>
        b.volumeInfo?.title.toLowerCase().includes(quote.bookTitle.toLowerCase())
      );
      const cover = book?.volumeInfo?.imageLinks?.thumbnail || null;
      return { ...quote, cover };
    });

    return quotesWithCovers;
  } catch (error) {
    console.error('Error fetching quotes with covers:', error);
    throw new Error('Failed to fetch quotes');
  }
};



