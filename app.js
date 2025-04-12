const express = require('express')
const crypto = require('crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movieSchema.mjs')

const PORT = process.env.PORT || 1234

const app = express()
app.use(express.json())
app.disable('x-powered-by')

// Middleware para registrar todas las peticiones
app.use((req, res, next) => {
  const start = Date.now()

  // Capturar el body original
  const originalBody = { ...req.body }

  // Capturar el método original de res.json para interceptar la respuesta
  const originalJson = res.json
  res.json = function (data) {
    const responseTime = Date.now() - start

    // Log de la petición completa
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      params: req.params,
      query: req.query,
      body: Object.keys(originalBody).length ? originalBody : undefined,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.headers['x-forwarded-for']
    })

    return originalJson.call(this, data)
  }

  next()
})

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
    console.log(`CORS error: Origin ${origin} not allowed`)
    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/movies', (req, res) => {
  const { genre, title } = req.query
  console.log(`GET /movies - Filtros: ${genre ? `género: ${genre}` : ''} ${title ? `título: ${title}` : ''}`)

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
  console.log(`GET /movies/${id} - Buscando película por ID`)

  const movie = movies.find(movie => movie.id === id)

  if (movie) {
    console.log(`Película encontrada: ${movie.title}`)
    return res.json(movie)
  }

  console.log(`Película con ID ${id} no encontrada`)
  res.status(404).json({ error: 'Movie Not Found' })
})

app.post('/movies', (req, res) => {
  console.log(`POST /movies - Creando nueva película: ${req.body.title}`)

  const result = validateMovie(req.body)

  if (result.error) {
    console.log(`Error de validación: ${result.error.message}`)
    return res.status(422).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  movies.push(newMovie)
  console.log(`Película creada con ID: ${newMovie.id}`)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  console.log(`PATCH /movies/${id} - Actualizando película`)

  const result = validatePartialMovie(req.body)

  if (result.error) {
    console.log(`Error de validación: ${result.error.message}`)
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) {
    console.log(`Película con ID ${id} no encontrada para actualizar`)
    return res.status(404).json({ error: 'Movie Not Found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  movies[movieIndex] = updateMovie
  console.log(`Película ${id} actualizada correctamente`)
  return res.status(200).json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  console.log(`DELETE /movies/${id} - Eliminando película`)

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) {
    console.log(`Película con ID ${id} no encontrada para eliminar`)
    return res.status(404).json({ error: 'Movie Not Found' })
  }

  const deletedMovie = movies[movieIndex].title
  movies.splice(movieIndex, 1)
  console.log(`Película "${deletedMovie}" con ID ${id} eliminada correctamente`)
  return res.json({ message: 'Movie Deleted' })
})

app.listen(PORT, () => {
  // console.log(`Servidor escuchando en http://localhost:${PORT}`)
  console.log(`[${new Date().toISOString()}] API de películas iniciada`)
})
