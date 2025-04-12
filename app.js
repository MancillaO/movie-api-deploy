const express = require('express')
const crypto = require('crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movieSchema.mjs')

const PORT = process.env.PORT || 1234

const app = express()
app.use(express.json())
app.disable('x-powered-by')

app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'https://movies.com'
    ]
    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    if (!origin) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/movies', (req, res) => {
  const { genre, title } = req.query

  // Si hay género, filtramos por género
  if (genre) {
    const filteredMovies = movies.filter(movie =>
      movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    // Retornamos el resultado (sea vacío o con películas)
    return res.json(filteredMovies.length > 0
      ? filteredMovies
      : { error: 'No movies found for this genre' }
    )
  }

  // Si hay título, filtramos por título
  if (title) {
    const filteredMovies = movies.filter(movie =>
      movie.title.toLowerCase().includes(title.toLowerCase())
    )
    // Retornamos el resultado (sea vacío o con películas)
    return res.json(filteredMovies.length > 0
      ? filteredMovies
      : { error: 'No movies found for this title' }
    )
  }

  // Si no hay filtros, devolvemos todas las películas
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)

  if (movie) return res.json(movie)
  res.status(404).json({ error: 'Movie Not Found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    return res.status(422).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) {
    return res.status(404).json({ error: 'Movie Not Found' })
  }
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  movies[movieIndex] = updateMovie
  return res.status(200).json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) {
    return res.status(404).json({ error: 'Movie Not Found' })
  }
  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie Deleted' })
})

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
