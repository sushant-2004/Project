import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Admin() {
  const [movies, setMovies] = useState([])
  const [movieForm, setMovieForm] = useState({ title: '', description: '', durationMinutes: 120, posterUrl: '', genre: '' })
  const [screeningForm, setScreeningForm] = useState({ movie: '', startTime: '', auditorium: 'A1', seatPrice: 250, seatsTotal: 30 })
  const [message, setMessage] = useState('')
  const [bookingsCount, setBookingsCount] = useState(0)
  const [summary, setSummary] = useState({ totalRevenue: 0, totalBookings: 0, byMovie: [] })

  const load = async () => {
    const r = await api.get('/movies')
    setMovies(r.data.movies)
    // As admin, this returns all bookings
    const b = await api.get('/bookings')
    setBookingsCount(b.data.bookings.length)
    const s = await api.get('/bookings/summary')
    setSummary(s.data)
  }

  useEffect(() => { load() }, [])

  const createMovie = async (e) => {
    e.preventDefault()
    setMessage('')
    const r = await api.post('/movies', movieForm)
    setMovieForm({ title: '', description: '', durationMinutes: 120, posterUrl: '', genre: '' })
    setMessage('Movie created')
    load()
  }

  const createScreening = async (e) => {
    e.preventDefault()
    setMessage('')
    const r = await api.post('/screenings', screeningForm)
    setScreeningForm({ movie: '', startTime: '', auditorium: 'A1', seatPrice: 250, seatsTotal: 30 })
    setMessage('Screening created')
  }

  const deleteMovie = async (id) => {
    await api.delete(`/movies/${id}`)
    setMessage('Movie deleted')
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="card p-4">
          <h1 className="text-2xl font-semibold mb-3">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="card p-3">
              <div className="text-sm text-gray-300">Total Bookings</div>
              <div className="text-2xl font-semibold">{summary.totalBookings}</div>
            </div>
            <div className="card p-3">
              <div className="text-sm text-gray-300">Total Revenue</div>
              <div className="text-2xl font-semibold">₹{summary.totalRevenue}</div>
            </div>
            <div className="card p-3">
              <div className="text-sm text-gray-300">Bookings (All)</div>
              <div className="text-2xl font-semibold">{bookingsCount}</div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-3">Per Movie Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-300">
                <tr>
                  <th className="py-2">Title</th>
                  <th className="py-2">Bookings</th>
                  <th className="py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {summary.byMovie.map(m => (
                  <tr key={m._id} className="border-t border-white/10">
                    <td className="py-2">{m.title}</td>
                    <td className="py-2">{m.bookings}</td>
                    <td className="py-2">₹{m.revenue}</td>
                  </tr>
                ))}
                {summary.byMovie.length === 0 && (
                  <tr><td className="py-2 text-gray-300" colSpan={3}>No data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-semibold mb-3">Add Movie</h1>
        <form onSubmit={createMovie} className="card p-4 space-y-3">
          <input className="w-full border p-2 rounded" placeholder="Title" value={movieForm.title} onChange={e=>setMovieForm(v=>({...v,title:e.target.value}))} required />
          <textarea className="w-full border p-2 rounded" placeholder="Description" value={movieForm.description} onChange={e=>setMovieForm(v=>({...v,description:e.target.value}))} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" type="number" placeholder="Duration (mins)" value={movieForm.durationMinutes} onChange={e=>setMovieForm(v=>({...v,durationMinutes:Number(e.target.value)}))} required />
            <input className="border p-2 rounded" placeholder="Genre" value={movieForm.genre} onChange={e=>setMovieForm(v=>({...v,genre:e.target.value}))} />
          </div>
          <input className="w-full border p-2 rounded" placeholder="Poster URL" value={movieForm.posterUrl} onChange={e=>setMovieForm(v=>({...v,posterUrl:e.target.value}))} />
          <button className="btn-primary">Create Movie</button>
        </form>
      </div>

      <div>
        <h1 className="text-2xl font-semibold mb-3">Add Screening</h1>
        <form onSubmit={createScreening} className="card p-4 space-y-3">
          <select className="w-full border p-2 rounded" value={screeningForm.movie} onChange={e=>setScreeningForm(v=>({...v,movie:e.target.value}))} required>
            <option value="">Select Movie</option>
            {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
          </select>
          <input className="w-full border p-2 rounded" type="datetime-local" value={screeningForm.startTime} onChange={e=>setScreeningForm(v=>({...v,startTime:e.target.value}))} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="border p-2 rounded" placeholder="Auditorium" value={screeningForm.auditorium} onChange={e=>setScreeningForm(v=>({...v,auditorium:e.target.value}))} required />
            <input className="border p-2 rounded" type="number" placeholder="Seat Price" value={screeningForm.seatPrice} onChange={e=>setScreeningForm(v=>({...v,seatPrice:Number(e.target.value)}))} required />
          </div>
          <input className="w-full border p-2 rounded" type="number" placeholder="Total Seats" value={screeningForm.seatsTotal} onChange={e=>setScreeningForm(v=>({...v,seatsTotal:Number(e.target.value)}))} required />
          <button className="btn-primary">Create Screening</button>
        </form>
      </div>

      <div className="md:col-span-2">
        <h2 className="text-xl font-semibold mb-3">Manage Movies</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {movies.map(m => (
            <div key={m._id} className="card p-3 space-y-2">
              {m.posterUrl ? <img alt={m.title} src={m.posterUrl} className="w-full h-40 object-cover rounded" /> : <div className="w-full h-40 bg-white/10 rounded flex items-center justify-center text-gray-300">No Image</div>}
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-gray-300">{m.genre}</div>
              <button className="btn-ghost" onClick={() => deleteMovie(m._id)}>Delete</button>
            </div>
          ))}
          {movies.length === 0 && <div className="text-gray-300">No movies added.</div>}
        </div>
      </div>

      {message && <div className="md:col-span-2 card p-3" style={{color:'#86efac'}}> {message} </div>}
    </div>
  )
}
