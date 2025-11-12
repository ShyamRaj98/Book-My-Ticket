import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { InputField, DateInput } from "../../components/InputFields.jsx";
import AdminMovieCard from "../../components/AdminMovieCard.jsx";
import Loading from "../../components/Loading.jsx";
import Error from "../../components/Error.jsx";

export default function TheaterMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    tmdbId: "",
    genres: "",
    runtime: "",
    posterPath: "",
    releaseDate: "",
    overview: "",
    language: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    setLoading(true);
    try {
      const res = await api.get("/theater/movies");
      setMovies(res.data.movies || []);
    } catch (err) {
      console.error(err);
      setError(err.res?.data?.error || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }

  // 🔍 TMDb Live Search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (query.trim().length > 1) searchTMDB(query);
      else setResults([]);
    }, 600);
    return () => clearTimeout(delay);
  }, [query]);

  async function searchTMDB(q) {
    setSearchLoading(true);
    try {
      const res = await api.get("/movies/tmdb-search", {
        params: { query: q },
      });
      setResults(res.data.results || []);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    } finally {
      setSearchLoading(false);
    }
  }

  async function addMovieFromTMDB(tmdbMovie) {
    if (!window.confirm(`Add "${tmdbMovie.title}" to database?`)) return;
    try {
      setAddingId(tmdbMovie.tmdbId);
      await api.post("/theater/movies", { tmdbId: tmdbMovie.tmdbId });
      alert(`"${tmdbMovie.title}" added successfully`);
      loadMovies();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add movie");
    } finally {
      setAddingId(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        genres: form.genres
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await api.put(`/theater/movies/${editingId}`, payload);
        alert("Movie updated");
      } else {
        await api.post("/theater/movies", payload);
        alert("Movie added");
      }
      resetForm();
      loadMovies();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save movie");
    }
  }

  function resetForm() {
    setForm({
      title: "",
      tmdbId: "",
      genres: "",
      runtime: "",
      posterPath: "",
      releaseDate: "",
      overview: "",
      language: "",
    });
    setEditingId(null);
  }

  function handleEdit(movie) {
    setForm({
      title: movie.title || "",
      tmdbId: movie.tmdbId || "",
      genres: (movie.genres || []).join(", "),
      runtime: movie.runtime || "",
      posterPath: movie.posterPath || "",
      releaseDate: movie.releaseDate ? movie.releaseDate.slice(0, 10) : "",
      overview: movie.overview || "",
      language: movie.language || "",
    });
    setEditingId(movie._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this movie?")) return;
    try {
      await api.delete(`/theater/movies/${id}`);
      alert("Deleted successfully");
      loadMovies();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete movie");
    }
  }

  // -------- UI ----------
  if (loading) return <Loading loader="page" text="Fetching movies..." />;
  if (error) return <Error text={error} />;

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto p-6 text-gray-800 space-y-10">
      {/* Manual Form */}
      <div className="bg-white p-6 rounded-2xl border-x-4 border-teal-600 shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-teal-600">
          {editingId ? "Edit Movie" : "Add Movie Manually"}
        </h2>
        <form className="" onSubmit={handleSubmit}>
          <InputField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <InputField
            label="TMDb ID"
            value={form.tmdbId}
            onChange={(e) => setForm({ ...form, tmdbId: e.target.value })}
          />
          <InputField
            label="Genres"
            value={form.genres}
            onChange={(e) => setForm({ ...form, genres: e.target.value })}
          />
          <InputField
            label="Runtime (mins)"
            type="number"
            value={form.runtime}
            onChange={(e) => setForm({ ...form, runtime: e.target.value })}
          />
          <InputField
            label="Poster URL"
            value={form.posterPath}
            onChange={(e) => setForm({ ...form, posterPath: e.target.value })}
          />
          <DateInput
            label="Release Date"
            value={form.releaseDate}
            onChange={(val) => setForm({ ...form, releaseDate: val })}
          />
          <InputField
            label="Overview"
            type="textarea"
            value={form.overview}
            onChange={(e) => setForm({ ...form, overview: e.target.value })}
          />
          <InputField
            label="Language"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          />

          <div className="flex gap-3 col-span-2 mt-4">
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
            >
              {editingId ? "Update Movie" : "Add Movie"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Live TMDb Search */}
      <div className="bg-white p-6 rounded-2xl border-x-4 border-teal-600 shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-teal-600">
          Search from TMDb
        </h2>

        <div className="flex sm:flex-row flex-col gap-3 items-center">
          <InputField
            placeholder="Search movie title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={() => {
              if (query.trim().length > 1) {
                searchTMDB(query);
              } else {
                alert("Please enter at least 2 characters");
              }
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg shadow-md transition-transform hover:scale-105"
          >
            Search
          </button>
        </div>

        {searchLoading && <Loading loader="list" text="Searching ..." />}

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {results.map((movie) => (
            <div
              key={movie.id || movie.tmdbId}
              className="bg-gray-100 p-3 rounded-xl shadow hover:shadow-lg transition"
            >
              <img
                src={
                  movie.poster_path || movie.posterPath
                    ? `https://image.tmdb.org/t/p/w500${
                        movie.poster_path || movie.posterPath
                      }`
                    : "https://dummyimage.com/300x400/000/fff&text=No+Image"
                }
                alt={movie.title}
                className="w-full h-64 object-cover rounded-lg mb-2"
              />
              <h3 className="font-semibold text-lg">{movie.title}</h3>
              <p className="text-sm text-gray-500">
                {movie.release_date?.slice(0, 4) ||
                  movie.releaseDate?.slice(0, 4) ||
                  ""}
              </p>
              <button
                onClick={() =>
                  addMovieFromTMDB({
                    tmdbId: movie.id || movie.tmdbId,
                    title: movie.title,
                    posterPath: movie.poster_path,
                    releaseDate: movie.release_date,
                  })
                }
                disabled={addingId === (movie.id || movie.tmdbId)}
                className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition-transform hover:scale-105"
              >
                {addingId === (movie.id || movie.tmdbId)
                  ? "Adding..."
                  : "Add to DB"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Movies List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 text-teal-600">
          Movies in Database
        </h2>
        {movies.length === 0 ? (
          <p>No movies found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <AdminMovieCard
                key={movie._id}
                movie={movie}
                movieEdit={() => handleEdit(movie)}
                movieDelete={() => handleDelete(movie._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
