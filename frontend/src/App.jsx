import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import MovieDetails from './pages/MovieDetails.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Checkout from './pages/Checkout.jsx'
import Admin from './pages/Admin.jsx'
import MyBookings from './pages/MyBookings.jsx'
import NavBar from './components/NavBar.jsx'
import { useAuth } from './context/AuthContext.jsx'

function PrivateRoute({ children, admin = false }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (admin && !user.isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div>
      <NavBar />
      <div className="container py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
          <Route path="/checkout/:screeningId" element={<PrivateRoute><Checkout /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute admin><Admin /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  )
}
