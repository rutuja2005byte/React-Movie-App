import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

// API Keys Configuration
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = import.meta.env.VITE_OMADB_API_KEY;

// Auto-detect API Source
const API_SOURCE = TMDB_API_KEY ? 'TMDB' : (OMDB_API_KEY ? 'OMDB' : 'MOCK');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

const TMDB_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_API_KEY}`
  }
}

// Fallback high-quality Mock Datasets
const MOCK_MOVIES = [
  {
    id: 'mock1',
    title: 'Dune: Part Two',
    rating: '8.2',
    posterUrl: 'https://image.tmdb.org/t/p/w500/czembDcAtioIKi7e5n34G4cOHKk.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock2',
    title: 'Kung Fu Panda 4',
    rating: '7.1',
    posterUrl: 'https://image.tmdb.org/t/p/w500/kDp1vUB3w3kyv6mCgYcm5dbTz6c.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock3',
    title: 'Godzilla x Kong: The New Empire',
    rating: '7.2',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vug5zn8jLIyjv6WuyJVn55g61eQ.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock4',
    title: 'Inside Out 2',
    rating: '7.6',
    posterUrl: 'https://image.tmdb.org/t/p/w500/vpnVM9B6v4FJFWHGbOORGL4A2zy.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock5',
    title: 'Deadpool & Wolverine',
    rating: '7.7',
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZq74lLDw9E2As6GZ4jYpt.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock6',
    title: 'Despicable Me 4',
    rating: '7.1',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wWb5qecPpz38i3gTvPy7n44SB4v.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock7',
    title: 'The Wild Robot',
    rating: '8.4',
    posterUrl: 'https://image.tmdb.org/t/p/w500/wUn89Ay82Ccl7WIDx654n9jI415.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock8',
    title: 'Gladiator II',
    rating: '6.8',
    posterUrl: 'https://image.tmdb.org/t/p/w500/h0r7uQY75L1f1d1lU5Z1Q4Z1j7a.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock9',
    title: 'Venom: The Last Dance',
    rating: '6.8',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aosm8dBF4JtTYm21JwAYXNzyjji.jpg',
    year: '2024',
    language: 'EN'
  },
  {
    id: 'mock10',
    title: 'Moana 2',
    rating: '7.0',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aLVr7t8glJzLoiT0Z965tLvlCLC.jpg',
    year: '2024',
    language: 'EN'
  }
];

const MOCK_TRENDING = [
  {
    $id: 't1',
    title: 'The Dark Knight',
    poster_url: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
  },
  {
    $id: 't2',
    title: 'Inception',
    poster_url: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg'
  },
  {
    $id: 't3',
    title: 'Interstellar',
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
  },
  {
    $id: 't4',
    title: 'The Matrix',
    poster_url: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg'
  },
  {
    $id: 't5',
    title: 'Avatar',
    poster_url: 'https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg'
  }
];

const DEFAULT_OMDB_IDS = [
  'tt0468569', // The Dark Knight
  'tt1375666', // Inception
  'tt0816692', // Interstellar
  'tt0133093', // The Matrix
  'tt0499549', // Avatar
  'tt0848228', // The Avengers
  'tt0172495', // Gladiator
  'tt10877209', // Spider-Man: No Way Home
  'tt0120338', // Titanic
];

// Normalize data structure for UI rendering
const mapMovieData = (movie) => {
  if (!movie) return null;

  // If already normalized
  if (movie.posterUrl !== undefined) {
    return movie;
  }

  // TMDB Format
  if (movie.vote_average !== undefined || movie.poster_path !== undefined) {
    return {
      id: movie.id,
      title: movie.title || movie.name || 'Untitled',
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : './no-movie.png',
      year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
      language: movie.original_language ? movie.original_language.toUpperCase() : 'N/A'
    };
  }

  // OMDB Format
  return {
    id: movie.imdbID || Math.random().toString(),
    title: movie.Title || 'Untitled',
    rating: movie.imdbRating || 'N/A',
    posterUrl: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : './no-movie.png',
    year: movie.Year || 'N/A',
    language: movie.Type ? movie.Type.toUpperCase() : 'N/A'
  };
};

const TrendingItem = ({ movie, index }) => {
  const itemRef = useRef(null)
  const posterRef = useRef(null)

  useGSAP(() => {
    gsap.from(itemRef.current, {
      opacity: 0,
      x: -30,
      duration: 0.5,
      delay: 0.6 + index * 0.1,
      ease: 'power2.out',
    })
  }, { scope: itemRef })

  const handleMouseEnter = () => {
    gsap.to(posterRef.current, {
      scale: 1.1,
      y: -6,
      duration: 0.3,
      ease: 'power2.out',
    })
    gsap.to(itemRef.current.querySelector('p'), {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    gsap.to(posterRef.current, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
    gsap.to(itemRef.current.querySelector('p'), {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return (
    <li
      ref={itemRef}
      className="cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p>{index + 1}</p>
      <div className="overflow-hidden rounded-lg">
        <img ref={posterRef} src={movie.poster_url} alt={movie.title} />
      </div>
    </li>
  )
}

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  const headerRef = useRef(null)
  const trendingRef = useRef(null)
  const moviesRef = useRef(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    tl.from(headerRef.current.querySelector('.hero-img'), {
      opacity: 0,
      y: -30,
      duration: 0.8,
    })
      .from(headerRef.current.querySelector('.hero-title'), {
        opacity: 0,
        y: 30,
        duration: 0.7,
      }, '-=0.4')
      .from(moviesRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
      }, '-=0.2')
  }, { scope: headerRef })

  useGSAP(() => {
    if (trendingRef.current) {
      gsap.from(trendingRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: 'power2.out',
      })
    }
  }, { dependencies: [trendingMovies.length] })

  // Debounce search input
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  // Fetch movies based on active source (TMDB / OMDB / MOCK)
  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    // --- MOCK MODE ---
    if (API_SOURCE === 'MOCK') {
      setTimeout(() => {
        if (query) {
          const filtered = MOCK_MOVIES.filter(m =>
            m.title.toLowerCase().includes(query.toLowerCase())
          );
          setMovieList(filtered);
        } else {
          setMovieList(MOCK_MOVIES);
        }
        setIsLoading(false);
      }, 300);
      return;
    }

    // --- TMDB MODE ---
    if (API_SOURCE === 'TMDB') {
      try {
        const endpoint = query
          ? `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
          : `${TMDB_BASE_URL}/discover/movie?sort_by=popularity.desc`;

        const response = await fetch(endpoint, TMDB_OPTIONS);
        if (!response.ok) throw new Error('Failed to fetch movies from TMDB');

        const data = await response.json();
        setMovieList((data.results || []).map(mapMovieData));

        if (query && data.results && data.results.length > 0) {
          await updateSearchCount(query, data.results[0]);
        }
      } catch (error) {
        console.error(`TMDB fetch error: ${error}`);
        setErrorMessage('Failed to load movies from TMDB. Falling back to demo data.');
        setMovieList(MOCK_MOVIES);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // --- OMDB MODE ---
    if (API_SOURCE === 'OMDB') {
      try {
        if (query) {
          const response = await fetch(`${OMDB_BASE_URL}/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
          if (!response.ok) throw new Error('Failed to fetch movies from OMDB');

          const data = await response.json();
          if (data.Response === 'False') {
            setMovieList([]);
            return;
          }

          if (data.Search && Array.isArray(data.Search)) {
            // Fetch detail for first 8 items in parallel to get imdbRating
            const detailPromises = data.Search.slice(0, 8).map(item =>
              fetch(`${OMDB_BASE_URL}/?i=${item.imdbID}&apikey=${OMDB_API_KEY}`)
                .then(res => res.json())
                .catch(() => item)
            );
            const detailedResults = await Promise.all(detailPromises);
            setMovieList(detailedResults.map(mapMovieData));

            if (detailedResults.length > 0) {
              await updateSearchCount(query, detailedResults[0]);
            }
          }
        } else {
          // Fetch default popular IMDb movies
          const promises = DEFAULT_OMDB_IDS.map(id =>
            fetch(`${OMDB_BASE_URL}/?i=${id}&apikey=${OMDB_API_KEY}`)
              .then(res => res.json())
              .catch(() => null)
          );
          const results = await Promise.all(promises);
          const validMovies = results.filter(movie => movie && movie.Response !== 'False');
          setMovieList(validMovies.map(mapMovieData));
        }
      } catch (error) {
        console.error(`OMDB fetch error: ${error}`);
        setErrorMessage('Failed to load movies from OMDB. Falling back to demo data.');
        setMovieList(MOCK_MOVIES);
      } finally {
        setIsLoading(false);
      }
    }
  }

  // Load trending movies
  const loadTrendingMovies = async () => {
    const isAppwriteReady = 
      import.meta.env.VITE_APPWRITE_PROJECT_ID && 
      import.meta.env.VITE_APPWRITE_DATABASE_ID && 
      import.meta.env.VITE_APPWRITE_COLLECTION_ID;

    if (!isAppwriteReady) {
      setTrendingMovies(MOCK_TRENDING);
      return;
    }

    try {
      const movies = await getTrendingMovies();
      if (Array.isArray(movies) && movies.length > 0) {
        setTrendingMovies(movies);
      } else {
        setTrendingMovies(MOCK_TRENDING);
      }
    } catch (error) {
      console.error(`Error loading trending movies: ${error}`);
      setTrendingMovies(MOCK_TRENDING);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header ref={headerRef}>
          <img className="hero-img" src="./hero.png" alt="Hero Banner" />
          <h1 className="hero-title">Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section ref={trendingRef} className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <TrendingItem key={movie.$id} movie={movie} index={index} />
              ))}
            </ul>
          </section>
        )}

        <section ref={moviesRef} className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner />
            </div>
          ) : errorMessage ? (
            <div className="text-center py-8">
              <p className="text-amber-400 font-medium mb-4">{errorMessage}</p>
              <ul className="grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {movieList.map((movie, index) => (
                  <MovieCard key={movie.id} movie={movie} index={index} />
                ))}
              </ul>
            </div>
          ) : (
            <ul>
              {movieList.map((movie, index) => (
                <MovieCard key={movie.id} movie={movie} index={index} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App;