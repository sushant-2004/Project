import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [screenings, setScreenings] = useState([])

  useEffect(() => {
    api.get(`/movies/${id}`).then(r => setMovie(r.data.movie))
    api.get(`/screenings?movie=${id}`).then(r => setScreenings(r.data.screenings))
  }, [id])

  if (!movie) return <div>Loading...</div>

  return (
    <div>
      <div className="flex gap-6 mb-6 card p-4">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt={movie.title} className="w-40 h-56 object-cover rounded" />
        ) : (
          <div className="w-40 h-56 bg-gray-200 rounded flex items-center justify-center">No Image</div>
        )}
        <div>
          <h1 className="text-3xl font-semibold">{movie.title}</h1>
          <p className="text-gray-600 mt-2">{movie.description}</p>
          <div className="mt-2 text-sm text-gray-500">{movie.genre} • {movie.durationMinutes} mins</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3 mt-6">Showtimes</h2>
      <div className="space-y-2">
        {screenings.map(s => (
          <div key={s._id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{new Date(s.startTime).toLocaleString()}</div>
              <div className="text-sm text-gray-300">Auditorium {s.auditorium} • ₹{s.seatPrice} per seat</div>
            </div>
            <Link className="btn-primary" to={`/checkout/${s._id}`}>Book</Link>
          </div>
        ))}
        {screenings.length === 0 && <div className="text-gray-300">No screenings available.</div>}
      </div>
    </div>
  )
}
