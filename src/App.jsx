import Search from './components/search.jsx';
import { useState, useEffect } from 'react';

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_OMADB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  header: {
    accept: 'application.json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const [ errorMessage, setErrorMessage ] = useState ('');

  const fetchMovies = async () => {
    try {

    } catch (error) {
      console.log(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movie. Please try again later.');
    }
  }

  useEffect ( () => {

  },[]);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner"/>
          <h1>Find <span className="text-gradient" >Movies</span> You'll Enjoy Without the Hassle</h1>
          
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        
      </div>
    </main>
  )
}

export default App;
