import { Client, Databases, ID, Query } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  // 1. Use Appwrite SDK to check if the search term exists in the database
 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.equal('searchTerm', searchTerm),
  ])

  const documents = Array.isArray(result?.documents) ? result.documents : [];

  // 2. If it does, update the count
  if (documents.length > 0) {
    const doc = documents[0];

    const newCount = typeof doc.count === 'number' ? doc.count + 1 : 1;

    await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
      count: newCount,
    })
    // 3. If it doesn't, create a new document with the search term and count as 1
  } else {
    const movieId = String(movie?.id || movie?.imdbID || movie?.movie_id || '');
    let posterUrl = null;
    if (movie?.posterUrl) {
      posterUrl = movie.posterUrl;
    } else if (movie?.poster_path) {
      posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    } else if (movie?.Poster && movie?.Poster !== 'N/A') {
      posterUrl = movie.Poster;
    }

    await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
      searchTerm,
      count: 1,
      movie_id: movieId || null,
      poster_url: posterUrl || null,
    })
  }
 } catch (error) {
  console.error('Appwrite error in updateSearchCount - please verify PROJECT_ID, DATABASE_ID and COLLECTION_ID:', {
    project: PROJECT_ID,
    database: DATABASE_ID,
    collection: COLLECTION_ID,
    error,
  });
 }
}

export const getTrendingMovies = async () => {
 try {
  const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
    Query.limit(5),
    Query.orderDesc("count")
  ])
  return Array.isArray(result?.documents) ? result.documents : [];
 } catch (error) {
   console.error('Appwrite error in getTrendingMovies - returning empty list. Verify your Appwrite setup:', {
     project: PROJECT_ID,
     database: DATABASE_ID,
     collection: COLLECTION_ID,
     error,
   });
  return [];
 }
}