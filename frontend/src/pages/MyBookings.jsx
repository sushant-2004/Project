import { useEffect, useState } from 'react'
import api from '../api/client'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    try {
      const r = await api.get('/bookings')
      setBookings(r.data.bookings)
    } catch (e) {
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const cancelBooking = async (id) => {
    try {
      await api.post(`/bookings/${id}/cancel`)
      await load()
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to cancel booking')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Bookings</h1>
      {error && <div className="card p-3 text-red-300 border-red-400/30">{error}</div>}
      <div className="space-y-3">
        {bookings.map(b => (
          <div key={b._id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{b?.screening?.movie?.title}</div>
              <div className="text-sm text-gray-300">{new Date(b?.screening?.startTime).toLocaleString()} • Audi {b?.screening?.auditorium}</div>
              <div className="text-sm">Seats: {b.seats.sort((a,b)=>a-b).join(', ')}</div>
              <div className="text-sm font-semibold">Paid: ₹{b.amount}</div>
              <div className="text-xs text-gray-300">Status: {b.paymentStatus}</div>
            </div>
            <div className="flex gap-2">
              {b.paymentStatus !== 'cancelled' && new Date(b?.screening?.startTime) > new Date() && (
                <button onClick={() => cancelBooking(b._id)} className="px-3 py-2 rounded-lg" style={{background:'#ff3b3b', color:'#fff'}}>Cancel</button>
              )}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <div className="text-gray-300">No bookings yet.</div>}
      </div>
    </div>
  )
}
