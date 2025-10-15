import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <nav className="sticky top-0 z-20 bg-surface/60 backdrop-blur border-b border-white/10">
      <div className="container py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">🎬</span>
          <span>MovieBooking</span>
        </Link>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.isAdmin && <Link to="/admin" className="btn-ghost text-sm">Admin</Link>}
              <Link to="/my-bookings" className="btn-ghost text-sm">My Bookings</Link>
              <span className="text-sm chip">Hi, {user.name}</span>
              <button className="btn-primary" onClick={() => { logout(); navigate('/') }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
