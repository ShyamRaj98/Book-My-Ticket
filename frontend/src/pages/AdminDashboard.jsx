// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios.js';
import SeatLayoutEditor from '../components/SeatLayoutEditor.jsx';

export default function AdminDashboard() {
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);

  // forms
  const [movieForm, setMovieForm] = useState({ title: '', tmdbId: '' });
  const [theaterForm, setTheaterForm] = useState({ name: '', location: '' });
  const [screenForm, setScreenForm] = useState({ theaterId: '', name: '', seatsJson: '[]' });
  const [showtimeForm, setShowtimeForm] = useState({ movieId: '', theaterId: '', screenName: '', startTime: '' });

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [mRes, tRes, sRes] = await Promise.all([
        api.get('/movies'),
        api.get('/admin/theaters-list').catch(()=>({ data: { theaters: [] } })), // optional endpoint below
        api.get('/showtimes')
      ]);
      setMovies(mRes.data.data || []);
      setTheaters(tRes.data.theaters || []);
      setShowtimes(sRes.data.data || []);
    } catch (err) {
      console.error('loadAll', err);
    } finally { setLoading(false); }
  }

  // Create movie
  async function onCreateMovie(e) {
    e.preventDefault();
    try {
      const res = await api.post('/admin/movies', movieForm);
      setMovieForm({ title: '', tmdbId: '' });
      loadAll();
      alert('Movie created');
    } catch (err) {
      console.error(err); alert('Failed to create movie');
    }
  }

  // Create theater
  async function onCreateTheater(e) {
    e.preventDefault();
    try {
      const res = await api.post('/admin/theaters', {
        name: theaterForm.name,
        location: theaterForm.location,
        screens: []
      });
      setTheaterForm({ name: '', location: '' });
      loadAll();
      alert('Theater created');
    } catch (err) {
      console.error(err); alert('Failed to create theater');
    }
  }

  // Add screen by JSON
  async function onAddScreen(e) {
    e.preventDefault();
    try {
      const seats = JSON.parse(screenForm.seatsJson || '[]');
      await api.post(`/admin/screens/${screenForm.theaterId}`, { name: screenForm.name, seats });
      setScreenForm({ theaterId: '', name: '', seatsJson: '[]' });
      loadAll();
      alert('Screen added');
    } catch (err) {
      console.error(err); alert('Failed to add screen: '+(err.response?.data?.error||err.message));
    }
  }

  // Create showtime
  async function onCreateShowtime(e) {
    e.preventDefault();
    try {
      await api.post('/admin/showtimes', showtimeForm);
      setShowtimeForm({ movieId: '', theaterId: '', screenName: '', startTime: '' });
      loadAll();
      alert('Showtime created');
    } catch (err) {
      console.error(err); alert('Failed to create showtime');
    }
  }

  // Edit showtime (simple: prompt new price update)
  async function onUpdateShowtimePrices(st) {
    try {
      const seatPrices = [];
      const sample = st.seats.slice(0,5).map(s => `${s.seatId}:${s.price}`).join(', ');
      const raw = prompt(`Enter seat price updates as seatId:price comma-separated (sample: ${sample})`);
      if (!raw) return;
      for (const part of raw.split(',')) {
        const [seatId, price] = part.split(':').map(x => x.trim());
        if (!seatId || !price) continue;
        seatPrices.push({ seatId, price: parseFloat(price) });
      }
      await api.patch(`/admin/showtimes/${st._id}`, { seatPrices });
      loadAll();
      alert('Prices updated');
    } catch (err) {
      console.error(err); alert('Failed to update prices');
    }
  }

  async function onDeleteShowtime(id) {
    if (!confirm('Delete this showtime?')) return;
    try {
      await api.delete(`/admin/showtimes/${id}`);
      loadAll();
      alert('Deleted');
    } catch (err) {
      console.error(err); alert('Failed to delete');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create Movie</h3>
          <form onSubmit={onCreateMovie} className="space-y-2">
            <input value={movieForm.title} onChange={e=>setMovieForm({...movieForm,title:e.target.value})} placeholder="Title" className="w-full p-2 border rounded" />
            <input value={movieForm.tmdbId} onChange={e=>setMovieForm({...movieForm,tmdbId:e.target.value})} placeholder="TMDb ID (optional)" className="w-full p-2 border rounded" />
            <button className="px-3 py-1 bg-blue-600 text-white rounded">Create</button>
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create Theater</h3>
          <form onSubmit={onCreateTheater} className="space-y-2">
            <input value={theaterForm.name} onChange={e=>setTheaterForm({...theaterForm,name:e.target.value})} placeholder="Name" className="w-full p-2 border rounded" />
            <input value={theaterForm.location} onChange={e=>setTheaterForm({...theaterForm,location:e.target.value})} placeholder="Location" className="w-full p-2 border rounded" />
            <button className="px-3 py-1 bg-green-600 text-white rounded">Create Theater</button>
          </form>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Add Screen (upload JSON of seats)</h3>
          <form onSubmit={onAddScreen} className="space-y-2">
            <select value={screenForm.theaterId} onChange={e=>setScreenForm({...screenForm,theaterId:e.target.value})} className="w-full p-2 border rounded">
              <option value="">Select theater</option>
              {theaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <input value={screenForm.name} onChange={e=>setScreenForm({...screenForm,name:e.target.value})} placeholder="Screen name e.g. Screen 1" className="w-full p-2 border rounded" />
            <textarea value={screenForm.seatsJson} onChange={e=>setScreenForm({...screenForm,seatsJson:e.target.value})} rows={6} className="w-full p-2 border rounded" />
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded">Add Screen</button>
              <button type="button" onClick={()=>{
                // open seat editor with empty default
                const sample = [
                  { seatId: 'A1', row: 'A', number: 1, type: 'premium', price: 300 },
                  { seatId: 'A2', row: 'A', number: 2, type: 'premium', price: 300 }
                ];
                setScreenForm({...screenForm, seatsJson: JSON.stringify(sample, null, 2)});
              }} className="px-3 py-1 bg-gray-200 rounded">Load sample JSON</button>
            </div>
          </form>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Create Showtime</h3>
          <form onSubmit={onCreateShowtime} className="space-y-2">
            <select value={showtimeForm.movieId} onChange={e=>setShowtimeForm({...showtimeForm,movieId:e.target.value})} className="w-full p-2 border rounded">
              <option value="">Select movie</option>
              {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>
            <select value={showtimeForm.theaterId} onChange={e=>setShowtimeForm({...showtimeForm,theaterId:e.target.value})} className="w-full p-2 border rounded">
              <option value="">Select theater</option>
              {theaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <input placeholder="Screen name (must match screen name in theater)" value={showtimeForm.screenName} onChange={e=>setShowtimeForm({...showtimeForm,screenName:e.target.value})} className="w-full p-2 border rounded" />
            <input type="datetime-local" value={showtimeForm.startTime} onChange={e=>setShowtimeForm({...showtimeForm,startTime:e.target.value})} className="w-full p-2 border rounded" />
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-600 text-white rounded">Create Showtime</button>
            </div>
          </form>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Showtimes</h3>
        <div className="grid gap-3">
          {showtimes.map(st => (
            <div key={st._id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{st.movie?.title || '—'}</div>
                <div className="text-sm text-gray-500">{new Date(st.startTime).toLocaleString()} — {st.theater?.name || '—'} — {st.screenName}</div>
                <div className="text-xs text-gray-600">Seats: {st.seats.length} • Booked: {st.seats.filter(s=>s.status==='booked').length}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>onUpdateShowtimePrices(st)} className="px-2 py-1 bg-yellow-500 text-white rounded">Update prices</button>
                <button onClick={()=>onDeleteShowtime(st._id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2">Visual Seat Editor (per-screen)</h3>
        <div>
          <p className="text-sm text-gray-600 mb-2">Pick a theater + screen to edit its seat template visually.</p>
          <SeatLayoutEditor theaters={theaters} onSaved={()=>loadAll()} />
        </div>
      </section>
    </div>
  );
}
