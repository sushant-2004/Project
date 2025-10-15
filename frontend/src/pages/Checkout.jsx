import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'

const Seat = ({ n, selected, disabled, onToggle }) => (
  <button
    disabled={disabled}
    onClick={() => onToggle(n)}
    className={`w-10 h-10 m-1 rounded text-sm border transition 
      ${disabled 
        ? 'bg-red-500/30 text-red-200 border-red-500/40 cursor-not-allowed' 
        : selected 
          ? 'bg-primary text-white border-primary-700' 
          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}
    `}
  >{n}</button>
)

export default function Checkout() {
  const { screeningId } = useParams()
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  const demo = (import.meta.env.VITE_DEMO_PAYMENTS || '').toString().toLowerCase() === 'true'

  const [screening, setScreening] = useState(null)
  const [movie, setMovie] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    api.get(`/screenings/${screeningId}`).then(r => {
      setScreening(r.data.screening)
      setMovie(r.data.screening.movie)
    }).finally(() => setLoading(false))
  }, [screeningId])

  const seatsTotal = screening?.seatsTotal || 0
  const seatsBooked = useMemo(() => new Set(screening?.seatsBooked || []), [screening])

  useEffect(() => {
    if (!selectedSeats.length) { setAmount(0); return }
    api.post('/bookings/preview', { screeningId, seats: selectedSeats }).then(r => setAmount(r.data.amount)).catch(() => setError('Some seats are unavailable, please reselect.'))
  }, [selectedSeats, screeningId])

  const toggleSeat = (n) => {
    setSelectedSeats((prev) => prev.includes(n) ? prev.filter(s => s !== n) : [...prev, n])
  }

  const payAndConfirm = async () => {
    setError('')
    if (!amount || selectedSeats.length === 0) { setError('Select seats first'); return }
    setPaying(true)
    try {
      if (!demo) {
        if (!stripe || !elements) return
        const { data } = await api.post('/payments/create-payment-intent', { amount })
        const clientSecret = data.clientSecret
        const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: elements.getElement(CardElement) }
        })
        if (stripeErr) throw stripeErr
        if (paymentIntent.status !== 'succeeded') throw new Error('Payment not successful')
        await api.post('/bookings/confirm', {
          screeningId,
          seats: selectedSeats,
          amount,
          stripePaymentIntentId: paymentIntent.id,
        })
      } else {
        // Demo mode: skip Stripe and confirm directly
        await api.post('/bookings/confirm', {
          screeningId,
          seats: selectedSeats,
          amount,
          stripePaymentIntentId: 'demo_payment_intent'
        })
      }
      navigate(`/`)
    } catch (e) {
      setError(e?.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!screening) return <div>Screening not found</div>

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-semibold mb-2">Select Seats</h1>
        <div className="card p-4">
          <div className="mb-2 text-sm text-gray-500">Screen layout</div>
          <div className="bg-gray-200 text-center py-1 rounded mb-3">SCREEN</div>
          <div className="flex flex-wrap">
            {Array.from({ length: seatsTotal }).map((_, idx) => {
              const n = idx + 1
              const disabled = seatsBooked.has(n)
              const selected = selectedSeats.includes(n)
              return <Seat key={n} n={n} selected={selected} disabled={disabled} onToggle={toggleSeat} />
            })}
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <div className="card p-4 space-y-2">
          <div className="font-medium">{movie?.title}</div>
          <div className="text-sm text-gray-300">{new Date(screening.startTime).toLocaleString()} • Audi {screening.auditorium}</div>
          <div className="border-t pt-2 text-sm">
            <div>Seats: {selectedSeats.sort((a,b)=>a-b).join(', ') || '-'}</div>
            <div className="text-gray-300">Base price per seat: ₹{screening.seatPrice}</div>
            <div className="font-semibold">Total: ₹{amount || 0}</div>
          </div>
          <div className="border-t pt-3 space-y-3">
            {!demo && <CardElement options={{ style: { base: { fontSize: '16px', color: '#ffffff' } } }} />}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button onClick={payAndConfirm} disabled={paying || (!demo && !stripe)} className="w-full btn-primary">
              {paying ? 'Processing...' : (demo ? 'Confirm Booking (Demo)' : 'Pay & Confirm Booking')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
