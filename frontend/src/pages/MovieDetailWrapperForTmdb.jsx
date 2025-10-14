// client/src/pages/MovieDetailWrapperForTmdb.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import MovieDetail from './MovieDetail';

export default function MovieDetailWrapperForTmdb() {
  const { tmdbId } = useParams();
  // redirect to the same component but with id prefixed
  return <MovieDetail key={`tmdb-${tmdbId}`} id={`tmdb-${tmdbId}`} />;
}
