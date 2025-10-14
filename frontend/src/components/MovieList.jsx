// frontend/src/components/MovieList.jsx
import React from 'react';
import MovieCard from './MovieCard';

export default function MovieList({ movies, onOpen }) {
  if (!movies || movies.length === 0) return <div className="p-4">No movies found.</div>;
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {movies.map(m => <MovieCard key={m._id} movie={m} onOpen={onOpen} />)}
    </div>
  );
}
