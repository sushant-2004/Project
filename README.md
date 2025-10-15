# STQA Project

A Software Testing and Quality Assurance project with Python.

## Project Structure

```
project_stqa/
├── src/               # Source code
├── tests/             # Test files
├── requirements.txt   # Project dependencies
└── README.md          # Project documentation
```

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running Tests

```
python -m pytest tests/
```

# Movie Ticket Booking (React + Node + Mongo + Stripe)

A simple, modern online movie ticket booking app.

- **Frontend**: React (Vite), React Router, Tailwind, Stripe Elements
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth
- **Payments**: Stripe (test mode)

## Project Structure

```
/(repo)
├─ backend/               # Express API
│  ├─ src/
│  │  ├─ models/          # Mongoose models
│  │  ├─ routes/          # Auth, Movies, Screenings, Bookings, Payments
│  │  ├─ middleware/      # JWT auth
│  │  ├─ lib/db.js        # Mongo connect
│  │  ├─ index.js         # App entry
│  │  └─ scripts/seed.js  # Seed admin + sample data
│  └─ .env.example
└─ frontend/              # React app (Vite)
   ├─ src/
   │  ├─ pages/           # Home, MovieDetails, Login, Register, Checkout, Admin
   │  ├─ components/      # NavBar
   │  ├─ context/         # AuthContext
   │  └─ api/             # Axios client
   └─ .env.example
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (or Atlas URI)
- Stripe account (for test keys)

## Backend Setup (`backend/`)

1. Copy env file and edit values:
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI` e.g. `mongodb://localhost:27017/movie_booking`
   - `JWT_SECRET` any long random string
   - `STRIPE_SECRET_KEY` from Stripe dashboard (test key)
   - `CLIENT_URL` default `http://localhost:5173`

2. Install deps:
   ```bash
   npm install
   ```

3. Seed sample data (admin user + sample movie/screening):
   ```bash
   npm run seed
   ```

4. Start API:
   ```bash
   npm run dev
   # API at http://localhost:5000
   ```

## Frontend Setup (`frontend/`)

1. Copy env file and edit values:
   ```bash
   cp .env.example .env
   ```
   - `VITE_API_BASE_URL` default `http://localhost:5000`
   - `VITE_STRIPE_PUBLISHABLE_KEY` from Stripe dashboard (test key)

2. Install deps and run dev server:
   ```bash
   npm install
   npm run dev
   # Web at http://localhost:5173
   ```

## Using The App

- **Login**: register a user or login with the seeded admin
  - Admin (from seed): `admin@local.test` / `admin123`
- **Admin**: add movies and screenings at `/admin`
- **Booking**: open a movie, pick a screening, select seats, pay with Stripe test card
  - Test card: `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP

## Notes

- Currency defaults to `INR`. Adjust in `backend/src/routes/payments.js` if needed.
- CORS is restricted to `CLIENT_URL` from backend `.env`.
- Seat booking uses a simple lock-on-confirm flow; for production, consider per-seat atomicity.
