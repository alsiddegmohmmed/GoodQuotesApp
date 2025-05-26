import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = 'AIzaSyC5aJC1Ts8N_MbmaFC_YL-ADi4biKve5lg';


const coverCache: { [title: string]: string | null } = {};
export const fetchBookCover = async (title: string): Promise<string | null> => {
    if (coverCache[title]) {
      return coverCache[title]; // Return cached cover if available
    }
  
    try {
      const response = await axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: title,
          maxResults: 1,
          key: API_KEY,
        },
      });

      const book = response.data.items?.[0];
      const cover = book?.volumeInfo?.imageLinks?.thumbnail || null;
      coverCache[title] = cover; // Cache the cover
      return cover;
    } catch (error) {
      console.error('Error fetching book cover:', error);
      return null;
    }
  };
