import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import Moviecard from "./components/Moviecard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";


const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceSearchTerm, setDebounceSearchTerm] = useState("");
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() => setDebounceSearchTerm(search), 500, [search]);

  const fetchMovies = async (query = "") => {
    if (query.trim() === "") {
      query = "";
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("failed to fetch movies");
      }
      const data = await response.json();

      if (data.Response === false) {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovies([]);
        return;
      }
      setMovies(data.results || []);
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.log(
        `Error in fetching the movies ${error}. Please try again later.`
      );
    } finally {
      setLoading(false);
    }
  };

  const LoadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);

  useEffect(() => {
    LoadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll enjoy
            without the hassle
          </h1>

          <Search search={search} setSearch={setSearch} />
        </header>
        <section>
          {search ? (
            loading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <div className="all-movies">
                {movies.length === 0 ? (
                  <h2 className="text-yellow-300 mt-4">
                    No movies found for <span>{search}</span>
                  </h2>
                ) : (
                  <>
                    <h2 className="mt-[40px]">
                      Search Results for{" "}
                      <span className="text-gradient">{search}</span>
                    </h2>
                    <ul>
                      {movies.map((movie) => (
                        <Moviecard key={movie.id} movie={movie} />
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )
          ) : (
            <>
              {trendingMovies.length > 0 && (
                <section className="trending">
                  <h2>Trending Movies</h2>
                  <ul>
                    {trendingMovies.map((movie, index) => (
                      <li key={movie.$id}>
                        <p>{index + 1}</p>
                        <img src={movie.poster_url} alt={movie.title} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <div className="all-movies">
                <h2 className="mt-[40px]">All movies</h2>
                <ul>
                  {movies.map((movie) => (
                    <Moviecard key={movie.id} movie={movie} />
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
