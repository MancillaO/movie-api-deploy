// import { this.MovieModel } from '../models/mysql/movie.js'
import { validateMovie, validatePartialMovie } from '../schemas/movieSchema.mjs'

export class MovieController {
  constructor ({ MovieModel }) {
    this.MovieModel = MovieModel
  }

  getAll = async (req, res) => {
    const { genre, title } = req.query
    const movies = await this.MovieModel.getAll({ genre, title })

    if (movies.length === 0) {
      return res.status(404).json({ error: 'No movies found' })
    }

    res.json(movies)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const movie = await this.MovieModel.getById({ id })

    if (movie) return res.json(movie)
    res.status(404).json({ error: 'Movie Not Found' })
  }

  create = async (req, res) => {
    const result = validateMovie(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }
    const newMovie = await this.MovieModel.create({ input: result.data })
    res.status(201).json(newMovie)
  }

  update = async (req, res) => {
    const result = validatePartialMovie(req.body)

    if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const { id } = req.params

    const updatedMovie = this.MovieModel.update({ id, input: result.data })

    if (!updatedMovie) {
      return res.status(404).json({ error: 'Movie Not Found' })
    }

    return res.status(200).json(updatedMovie)
  }

  delete = async (req, res) => {
    const { id } = req.params

    const result = await this.MovieModel.delete({ id })

    if (!result) {
      return res.status(404).json({ error: 'Movie Not Found' })
    }
    return res.json({ message: 'Movie Deleted' })
  }
}
