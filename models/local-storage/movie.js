import { randomUUID } from 'node:crypto'
import { readJSON } from '../../utils.js'

const movies = readJSON('./movies.json')

export class MovieModel {
  static async getAll ({ genre, title }) {
    // Si hay género, filtramos por género
    if (genre) {
      return movies.filter(movie =>
        movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
    }
    // Si hay título, filtramos por título
    if (title) {
      return movies.filter(movie =>
        movie.title.toLowerCase().includes(title.toLowerCase())
      )
    }
    // Si no hay filtros, devolvemos todas las películas
    return movies
  }

  static async getById ({ id }) {
    const movie = movies.find(movie => movie.id === id)
    return movie
  }

  static async create ({ input }) {
    const newMovie = {
      id: randomUUID(),
      ...input
    }
    movies.push(newMovie)
    return newMovie
  }

  static async update ({ id, input }) {
    const movieIndex = movies.findIndex(input => input.id === id)
    if (movieIndex < 0) return false

    movies[movieIndex] = {
      ...movies[movieIndex],
      ...input
    }
    return movies[movieIndex]
  }

  static async delete ({ id }) {
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex < 0) return false

    movies.splice(movieIndex, 1)
    return true
  }
}
