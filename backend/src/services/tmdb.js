// server/services/tmdb.js
import dotenv from 'dotenv';
dotenv.config();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.warn('Warning: TMDB_API_KEY not set. External search will fail until you set it in .env');
}

// helper: search TMDb movies
export async function searchTmdb(query, page = 1) {
  if (!TMDB_API_KEY) throw new Error('TMDB_API_KEY not configured');
  const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${query}&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDb search failed');
  return res.json();
}

// helper: fetch TMDb movie detail by id
 export async function fetchTmdbMovie(tmdbId) {
  if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY not configured");

  const url = `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text();
    console.error("TMDb fetch failed:", text);
    throw new Error("TMDb fetch failed: " + text);
  }

  return res.json();
}
