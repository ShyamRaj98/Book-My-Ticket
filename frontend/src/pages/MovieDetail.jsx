import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format, addDays, isSameDay, parseISO } from "date-fns";
import { FaChevronLeft } from "react-icons/fa6";
import api from "../api/axios.js";

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch movie + showtimes
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (id.startsWith("tmdb-")) {
          const tmdbId = id.replace("tmdb-", "");
          const res = await api.get(`/movies/tmdb/${tmdbId}`);
          setMovie({
            title: res.data.title,
            overview: res.data.overview,
            posterPath: res.data.poster_path,
            releaseDate: res.data.release_date,
          });
          setShowtimes([]);
          console.log(res.data);
        } else {
          const res = await api.get(`/movies/${id}`);
          setMovie(res.data);

          const st = await api.get("/showtimes", { params: { movieId: id } });
          setShowtimes(st.data.data || []);
          console.log(res.data);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load movie");
      } finally {
        setLoading(false);
      }
    }
    load();
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

  if (loading) return <div className="p-6 text-gray-600">Loading movie...</div>;
  if (!movie) return <div className="p-6 text-red-600">Movie not found</div>;

  // Create next 7 days for date selection
  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <div className="container mx-auto px-4">
      <Link
        to="/"
        className="w-fit p-2 px-4 m-1 rounded-xl border-1 border-gray-300 flex flex-row items-center justify-center gap-1 shadow-md"
      >
        <FaChevronLeft size={24} color="black" /> Back
      </Link>
      <div className="flex flex-col gap-6 items-start justify-start m-2 md:flex-row">
        <img
          src={
            movie.Poster !== "N/A"
              ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
              : "https://dummyimage.com/300x400/000/fff&text=Image+not+found"
          }
          alt={movie.title}
          className="w-full md:w-2/4 lg:w-1/3 rounded-xl shadow-xlS"
        />
        <div>
          {/* <p className="w-fit p-1 px-3 rounded-r-xl bg-red-700 text-white font-semibold capitalize flex flex-row items-center gap-1">
            {movie.Type}
            <MdOutlineStarPurple500 size={24} color="yellow" className="ml-1" />
            {movie.imdbRating}
          </p> */}
          <div className="mb-4">
            <h1 className="bg-linear-to-r from-red-300 to-transparent text-2xl font-semibold p-2 border-l-3 border-l-red-700 ">
              {movie.title} (
              {movie.releaseDate
                ? new Date(movie.releaseDate).toLocaleDateString()
                : ""}
              )
            </h1>
          </div>
          <div className="mb-2 py-2 border-y-2 border-y-gray-200 flex flex-row flex-wrap gap-2">
            <span className="font-semibold">{movie.runtime}</span>
            <span className="mx-1">|</span>
            <span className="font-semibold">
              {movie.releaseDate
                ? new Date(movie.releaseDate).toLocaleDateString
                : ""}
            </span>
            {/* <span className="mx-1">|</span>
            <span className="font-semibold">{movie.Country}</span> */}
          </div>
          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <span className="font-semibold">{movie.language}</span>
          </div>
          <div className="mb-2 flex flex-row flex-wrap items-center gap-1">
            {movie.genres.map((movie, idx) => (
              <span
                key={idx}
                className="w-fit bg-gray-100 border-2 border-gray-700 rounded-3xl p-1 px-2 mr-1 hover:bg-gray-300"
              >
                {movie}
              </span>
            ))}
          </div>
          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <p className="font-bold">Cast</p>
            <p>
              {movie.Actors || "Joseph Vijay, Sanjay Dutt, Trisha Krishnan"}
            </p>
          </div>
          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <p className="font-bold">Director</p>
            <p>{movie.Director || "Lokesh Kanagaraj"}</p>
          </div>
          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <p className="font-bold mb-2">Rating</p>
            {/* <p className="mb-2 flex flex-row flex-wrap items-center gap-2">
              {movie.Ratings?.map((rating, idx) => (
                <span
                  key={idx}
                  className="w-fit bg-gray-100 border-2 border-gray-700 rounded-3xl p-1 px-2 mr-1 hover:bg-gray-300"
                >
                  {rating.Source}: {rating.Value}
                </span>
              ))}
            </p> */}
          </div>
          <div className="mb-2 py-2 border-y-2 border-y-gray-200">
            <p className="font-bold">Overview</p>
            <p>{movie.overview}</p>
          </div>
        </div>
      </div>
      <div className="border-t-2 border-red-700 py-4 flex flex-col justify-center items-center">
        {/* Date Selector */}
        <div className="w-full flex gap-2 mb-6 overflow-x-scroll pb-2">
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
              <div className="text-sm font-semibold">{format(date, "EEE")}</div>
              <div className="text-xs">{format(date, "dd MMM")}</div>
            </button>
          ))}
        </div>

        {/* Showtimes */}
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
                      className="px-4 py-2 border border-reed-500 text-red-600 rounded hover:bg-red-500 hover:text-white transition text-sm"
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
