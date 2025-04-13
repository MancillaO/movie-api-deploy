import express, { json } from 'express'
import { createMovieRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

export const createApp = ({ MovieModel }) => {
  const PORT = process.env.PORT || 3000

  const app = express()
  app.use(json())
  app.disable('x-powered-by')
  app.use(corsMiddleware())

  app.use('/movies', createMovieRouter({ MovieModel }))

  app.listen(PORT, () => {
    console.log(`\nServidor escuchando en http://localhost:${PORT}\n`)
  })
}
