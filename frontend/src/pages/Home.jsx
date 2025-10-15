import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/movies').then(r => setMovies(r.data.movies)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Now Showing</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map(m => (
          <Link key={m._id} to={`/movie/${m._id}`} className="card transition overflow-hidden hover:shadow-soft">
            {m.posterUrl ? (
              <img src={m.posterUrl} alt={m.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">No Image</div>
            )}
            <div className="p-3">
              <div className="font-medium">{m.title}</div>
              <div className="text-sm text-gray-300">{m.genre || 'General'}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
