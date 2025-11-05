import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GoHeartFill } from "react-icons/go";
import api from "../api/axios";

const MovieCard = ({ movie }) => {
  const [hasShowtime, setHasShowtime] = useState(false);

  useEffect(() => {
    const checkShowtime = async () => {
      try {
        if (!movie._id) return;

        const res = await api.get(`/showtimes/availability/${movie._id}`);
        setHasShowtime(res.data.available);
      } catch (err) {
        console.error("Error checking showtime:", err);
      }
    };

    checkShowtime();
  }, [movie._id]);

  return (
    <Link to={`/movies/${movie._id}`}>
      <div className="h-full group border-2 border-red-700 rounded-3xl flex flex-col justify-between overflow-hidden">
        <div className="relative overflow-hidden">
          <img
            src={
              movie.posterPath !== "N/A"
                ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                : "https://dummyimage.com/300x400/000/fff&text=Image+not+found"
            }
            alt={movie.title}
            className="w-full h-[300px] object-cover group-hover:scale-110 transition-all duration-300"
          />
          <button
            className="bg-white w-[40px] h-[40px] rounded-full absolute top-10 right-[-50px] group-hover:right-[10px] flex items-center justify-center transition-all duration-300"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <GoHeartFill size={24} color="red" />
          </button>

          {/* Showtime Badge */}
          <div
            className={`absolute top-2 right-2 px-2 py-1 text-xs rounded text-white opacity-90 ${
              hasShowtime ? "bg-green-600" : "bg-gray-500"
            }`}
          >
            {hasShowtime ? "Showtime" : "No Showtime"}
          </div>
        </div>

        <div className="pt-6 p-2 relative">
          <p className="w-fit bg-red-700 text-white font-semibold rounded-l-xl absolute top-0 right-0 px-2 pl-3">
            {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ""}{" "}
            - {movie.runtime}min
          </p>
          <h3 className="movie-title h-[50px] text-lg font-semibold leading-5">
            {movie.title}
          </h3>
          <p className="movie-plot text-md text-gray-500">
            {movie.genres?.join("/") || ""}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
