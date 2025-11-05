import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { IoSearch } from "react-icons/io5";
import MovieCard from "../components/MovieCard.jsx";

export default function MovieSearch() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Fetch movies (local DB)
  const fetchMovies = async (append = false) => {
    setLoading(true);
    try {
      const res = await api.get("/movies", {
        params: { q, genre, from, to, page },
      });

      const newMovies = res.data.data || [];
      if (append) {
        setResults((prev) => [...prev, ...newMovies]);
      } else {
        setResults(newMovies);
      }

      setHasMore(newMovies.length > 0 && newMovies.length >= 20);
      setTotalResults(newMovies.length);
    } catch (err) {
      console.error(err);
      alert("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // ✅ Handle Search
  const doSearch = async (e) => {
    if (e) e.preventDefault();
    setPage(1);

    if (!q && !genre && !from && !to) {
      fetchMovies(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/movies", {
        params: { q, genre, from, to, page: 1 },
      });

      if (res.data.data && res.data.data.length) {
        setResults(res.data.data);
        setHasMore(res.data.data.length >= 20);
      } else {
        alert("Movie not available");
        setResults([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load more movies (pagination)
  const loadMore = async () => {
    setPage((prev) => prev + 1);
    await fetchMovies(true);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      {/* 🔍 Search + Filters */}
      <form
        onSubmit={doSearch}
        className="max-w-5xl mx-auto p-4 border-2 border-red-700 rounded-2xl bg-white flex flex-col md:flex-row flex-wrap items-center justify-center gap-3 shadow-2xl"
      >
        {/* Search */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title..."
          className="w-full md:flex-1 bg-white rounded-xl p-2 text-lg font-semibold border border-gray-300 outline-0 shadow-sm"
        />

        {/* Genre */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full md:w-40 bg-white rounded-xl p-2 border border-gray-300 font-semibold text-gray-700"
        >
          <option value="">All Genres</option>
          <option value="Action">Action</option>
          <option value="Drama">Drama</option>
          <option value="Comedy">Comedy</option>
          <option value="Romance">Romance</option>
          <option value="Horror">Horror</option>
          <option value="Thriller">Thriller</option>
          <option value="Sci-Fi">Sci-Fi</option>
        </select>

        {/* Date Filters */}
        <div className="flex items-center gap-2">
          <label className="text-gray-600 text-sm">From:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-600 text-sm">To:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Search Button */}
        <button
          className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold shadow-md hover:bg-red-700 transition flex items-center justify-center gap-2"
          disabled={loading}
        >
          <IoSearch size={22} />
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* 🌀 Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="animate-pulse h-72 bg-gray-200 rounded shadow"
              />
            ))}
        </div>
      ) : (
        <>
          {/* 🎬 Movie Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-6">
            {results.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {/* 🔘 Load More */}
          {hasMore && (
            <div className="flex justify-center my-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 border border-gray-400 rounded-xl px-6 py-2 text-lg font-semibold shadow-md transition"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {/* ❌ No Results */}
          {!loading && results.length === 0 && (
            <p className="text-center text-gray-600 mt-10 text-lg font-semibold">
              No movies found.
            </p>
          )}
        </>
      )}
    </div>
  );
}
