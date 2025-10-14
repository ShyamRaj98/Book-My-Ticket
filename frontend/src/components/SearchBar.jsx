// frontend/src/components/SearchBar.jsx
import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [date, setDate] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onSearch({ q: q.trim(), genre: genre.trim(), date });
  };

  return (
    <form onSubmit={submit} className="flex gap-2 items-center p-4 bg-white rounded shadow">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search movie title" className="flex-1 p-2 border rounded" />
      <input value={genre} onChange={e=>setGenre(e.target.value)} placeholder="Genre (comma)" className="p-2 border rounded w-44" />
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="p-2 border rounded" />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
    </form>
  );
}
