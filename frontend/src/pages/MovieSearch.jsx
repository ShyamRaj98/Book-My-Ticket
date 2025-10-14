// client/src/pages/MovieSearch.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import { Link } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import MovieCard from "../components/MovieCard.jsx";

export default function MovieSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async (e) => {
    if (e) e.preventDefault();
    if (!q) return;
    setLoading(true);
    try {
      const res = await api.get("/movies", { params: { q } });
      if (res.data.data && res.data.data.length) {
        setResults(res.data.data);
      } else {
        const tmdb = await api.get("/movies/tmdb-search", { params: { q } });
        setResults(
          (tmdb.data.results || []).map((item) => ({
            _id: `tmdb-${item.tmdbId}`,
            tmdbId: item.tmdbId,
            title: item.title,
            posterPath: item.posterPath,
            releaseDate: item.releaseDate,
            overview: item.overview,
          }))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <form
        onSubmit={doSearch}
        className="max-w-lg w-full mx-auto mt-2 p-1 border-2 border-red-700 rounded-lg flex flex-col md:flex-row items-center justify-center gap-x-2 gap-y-3"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title..."
          className="w-full bg-white rounded-xl p-2 text-lg font-semibold border-1 border-gray-300 outline-0 shadow-xl"
        />
        <button
          className="bg-white w-full md:w-fit hover:bg-gray-100 p-2 font-semibold border-1 border-gray-300 rounded-xl shadow-xl transition"
          disabled={loading}
        >
          <IoSearch size={24} color="red" className="cursor-pointer mx-auto" />
        </button>
      </form>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 mt-6">
          {results.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
