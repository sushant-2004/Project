import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '../lib/db.js'
import User from '../models/User.js'
import Movie from '../models/Movie.js'
import Screening from '../models/Screening.js'

dotenv.config()

async function run() {
  await connectDB()

  // Admin user
  const adminEmail = 'admin@local.test'
  let admin = await User.findOne({ email: adminEmail })
  if (!admin) {
    const passwordHash = await bcrypt.hash('admin123', 10)
    admin = await User.create({ name: 'Admin', email: adminEmail, passwordHash, isAdmin: true })
    console.log('Created admin user: admin@local.test / admin123')
  } else {
    console.log('Admin already exists:', adminEmail)
  }

  // Sample movie
  let movie = await Movie.findOne({ title: 'The Sample Movie' })
  if (!movie) {
    movie = await Movie.create({
      title: 'The Sample Movie',
      description: 'An example movie to demo the booking flow.',
      durationMinutes: 120,
      posterUrl: '',
      genre: 'Drama'
    })
    console.log('Created sample movie')
  }

  // Sample screening (in 2 hours)
  const start = new Date(Date.now() + 2 * 60 * 60 * 1000)
  const existing = await Screening.findOne({ movie: movie._id, startTime: { $gte: new Date(Date.now() - 60*60*1000) } })
  if (!existing) {
    await Screening.create({
      movie: movie._id,
      startTime: start,
      auditorium: 'A1',
      seatPrice: 250,
      seatsTotal: 30,
    })
    console.log('Created sample screening')
  } else {
    console.log('Sample screening already exists')
  }

  await mongoose.connection.close()
  console.log('Done')
}

run().catch(err => { console.error(err); process.exit(1) })
