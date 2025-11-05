import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { FaChevronLeft } from "react-icons/fa6";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch movie + showtimes
  useEffect(() => {
    async function loadMovie() {
      try {
        setLoading(true);

        // 1️⃣ Fetch movie from local DB
        const localRes = await api.get(`/movies/${id}`);
        const localMovie = localRes.data;

        // 2️⃣ Fetch TMDB data (if tmdbId exists, else search by title)
        let tmdbData = null;
        try {
          if (localMovie.tmdbId) {
            const tmdbRes = await api.get(`/movies/tmdb/${localMovie.tmdbId}`);
            tmdbData = tmdbRes.data;
            console.log("Fetched TMDB data by ID:", tmdbData);
          } else if (localMovie.title) {
            const searchRes = await api.get(`/movies/search-tmdb`, {
              params: { query: localMovie.title },
            });
            const first = searchRes.data.results?.[0];
            if (first?.tmdbId) {
              const detailsRes = await api.get(`/movies/tmdb/${first.tmdbId}`);
              tmdbData = detailsRes.data;
            }
          }
        } catch (err) {
          console.warn("TMDB fetch failed:", err.message);
        }

        // 3️⃣ Merge both sources safely
        const mergedMovie = {
          ...localMovie,
          title: localMovie.title || tmdbData?.title,
          overview: localMovie.overview || tmdbData?.overview,
          posterPath:
            `https://image.tmdb.org/t/p/w500${localMovie.posterPath}` ||
            (tmdbData?.poster_path
              ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
              : "https://dummyimage.com/300x400/000/fff&text=No+Image"),
          releaseDate:
            localMovie.releaseDate || tmdbData?.release_date || "Unknown",
          runtime: localMovie.runtime || tmdbData?.runtime || "N/A",
          genres:
            localMovie.genres?.length > 0
              ? localMovie.genres
              : tmdbData?.genres?.map((g) => g.name) || [],
          language:
            localMovie.language ||
            tmdbData?.original_language?.toUpperCase() ||
            "N/A",
          cast:
            localMovie.Actors ||
            tmdbData?.credits?.cast
              ?.slice(0, 5)
              ?.map((c) => c.name)
              ?.join(", ") ||
            "Not available",
          director:
            localMovie.Director ||
            tmdbData?.credits?.crew?.find((c) => c.job === "Director")?.name ||
            "Not available",
        };
        setMovie(mergedMovie);

        // 4️⃣ Fetch showtimes
        const stRes = await api.get("/showtimes", { params: { movieId: id } });
        setShowtimes(stRes.data.data || []);
      } catch (err) {
        console.error("Error loading movie:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMovie();
  }, [id]);

  // Filter showtimes for selected date
  const filteredShowtimes = showtimes.filter((s) =>
    isSameDay(parseISO(s.startTime), selectedDate)
  );

  // Group showtimes by theater
  const groupedByTheater = filteredShowtimes.reduce((acc, s) => {
    const theaterName = s.theater?.name || "Unknown Theater";
    if (!acc[theaterName]) acc[theaterName] = [];
    acc[theaterName].push(s);
    return acc;
  }, {});

  if (loading) return <Loading loader="page" text="" />;
  if (!movie) return <div className="p-6 text-red-600">Movie not found</div>;

  // Create next 7 days for date selection
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="container mx-auto px-4">
      {/* 🔙 Back Button */}
      {/* <Link
        to="/movies"
        className="w-fit p-2 px-4 m-1 rounded-xl border-1 border-gray-300 flex flex-row items-center justify-center gap-1 shadow-md"
      >
        <FaChevronLeft size={24} color="black" /> Back
      </Link> */}

      <div className="flex flex-col gap-6 items-start justify-start m-2 md:flex-row bg-[url(`)]">
        {/* 🎬 Poster */}
        <div className="relative min-w-[150px] max-w-[400px]">
          <img
            src={
              movie.posterPath
                ? movie.posterPath
                : "https://dummyimage.com/300x400/000/fff&text=Image+not+found"
            }
            alt={movie.title}
            className="w-full rounded-xl shadow-xl"
          />

          {/* Showtime Badge */}
          <div className="absolute top-2 right-2">
            {showtimes.length > 0 ? (
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Showtime
              </span>
            ) : (
              <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                No Showtime
              </span>
            )}
          </div>
        </div>

        {/* 🎥 Movie Info */}
        <div className="flex-2">
          <div className="mb-4">
            <h1 className="bg-linear-to-r from-red-300 to-transparent text-2xl font-semibold p-2 border-l-3 border-l-red-700 ">
              {movie.title} (
              {movie.releaseDate
                ? new Date(movie.releaseDate).getFullYear()
                : ""}
              )
            </h1>
          </div>

          <div className="mb-2 py-2 border-y-2 border-y-gray-200 flex flex-row flex-wrap gap-2">
            <span className="font-semibold">{movie.runtime}</span>
            <span className="mx-1">|</span>
            <span className="font-semibold">
              {movie.releaseDate
                ? new Date(movie.releaseDate).toLocaleDateString()
                : ""}
            </span>
          </div>

          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <span className="font-semibold">{movie.language}</span>
          </div>

          <div className="mb-2 flex flex-row flex-wrap items-center gap-1">
            {movie.genres.map((genre, idx) => (
              <span
                key={idx}
                className="w-fit bg-gray-100 border-2 border-gray-700 rounded-3xl p-1 px-2 mr-1 hover:bg-gray-300"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <p className="font-bold">Cast</p>
            <p>{movie.cast}</p>
          </div>

          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <p className="font-bold">Director</p>
            <p>{movie.director}</p>
          </div>

          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <p className="font-bold">Overview</p>
            <p>{movie.overview}</p>
          </div>
        </div>
      </div>

      {/* 📅 Showtime Section */}
      <div className="border-t-2 border-red-700 py-4 flex flex-col justify-center items-center">
        {/* Date Selector */}
        <div className="overflow-x-scroll md:overflow-auto w-full mb-6 px-4">
          <div className="w-full flex justify-start md:justify-center gap-2 mb-6 pb-2">
            {next7Days.map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg border transition ${
                  isSameDay(date, selectedDate)
                    ? "bg-red-500 text-white border-red-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <div className="text-sm font-semibold ">
                  {format(date, "EEE")}
                </div>
                <div className="text-xs text-nowrap">
                  {format(date, "dd MMM")}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Showtimes List */}
        <h2 className="text-2xl font-semibold mb-4">Showtimes</h2>

        {Object.keys(groupedByTheater).length ? (
          <div className="space-y-6">
            {Object.entries(groupedByTheater).map(([theaterName, times]) => (
              <div key={theaterName}>
                <h3 className="font-semibold text-lg mb-2 text-gray-700">
                  {theaterName}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {times.map((s) => (
                    <Link
                      key={s._id}
                      to={`/showtimes/${s._id}`}
                      className="px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-500 hover:text-white transition text-sm"
                    >
                      {format(parseISO(s.startTime), "hh:mm a")}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">
            No showtimes available for this date.
          </p>
        )}
      </div>
    </div>
  );
}
