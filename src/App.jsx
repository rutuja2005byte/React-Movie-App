import Search from './components/search.jsx';
import { useState, useEffect } from 'react';

const API_BASE_URL = "https://www.omdbapi.com";
const API_KEY = import.meta.env.VITE_OMADB_API_KEY;

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchDefaultMovies = async () => {
    setErrorMessage('');
    try {
      const defaultIds = [
        'tt0468569',
        'tt1375666',
        'tt0816692',
        'tt0133093',
        'tt0499549',
        'tt0848228',
        'tt0172495',
        'tt10877209',
        'tt0120338',
      ];

      const promises = defaultIds.map(id =>
        fetch(`${API_BASE_URL}/?i=${id}&apikey=${API_KEY}`).then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      const formattedMovies = results.filter(movie => movie.Response !== 'False');
      setMovies(formattedMovies);
    } catch (error) {
      console.log(`Error fetching default movies: ${error}`);
      setErrorMessage('Failed to load top movies. Please try again later.');
      setMovies([]);
    }
  };

  const fetchMovies = async (query) => {
    setErrorMessage('');
    try {
      const endpoint = `${API_BASE_URL}/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error('Failed to fetch Movies');
      }

      const data = await response.json();

      if (data.Response === 'False') {
        throw new Error(data.Error || 'Failed to fetch Movies');
      }

      setMovies(data.Search || []);
    } catch (error) {
      console.log(`Error fetching movies: ${error}`);
      setErrorMessage(error.message || 'Error fetching movie. Please try again later.');
      setMovies([]);
    }
  };

  useEffect(() => {
    const cleanSearchTerm = debouncedSearchTerm.trim();
    
    if (cleanSearchTerm === '') {
      fetchDefaultMovies();
    } else if (cleanSearchTerm.length < 3) {
      setErrorMessage('');
    } else {
      fetchMovies(cleanSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner"/>
          <h1>Find <span className="text-gradient" >Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="all-movies">
          <h2>All Movies</h2>

          {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movies.map((movie) => (
                <li key={movie.imdbID} className="movie-card">
                  <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : './no-movie.png'} 
                    alt={movie.Title} 
                  />
                  
                  <div className="mt-4">
                    <h3>{movie.Title}</h3>
                    
                    <div className="content">
                      <div className="rating">
                        <img src="./star.png" alt="Star Icon" />
                        <p>{movie.imdbRating || 'N/A'}</p>
                      </div>
                      
                      <span>•</span>
                      <p className="lang">{movie.Type}</p>
                      
                      <span>•</span>
                      <p className="year">{movie.Year}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        
      </div>
    </main>
  );
};

export default App;