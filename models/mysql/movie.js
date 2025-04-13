import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

const config = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
}

const connection = await mysql.createConnection(config)

export class MovieModel {
  static async getAll ({ genre, title }) {
    if (genre) {
      const query = `
        SELECT DISTINCT BIN_TO_UUID(m.id) AS id, m.title, m.year, m.director, m.duration, m.poster, m.rate 
        FROM movies m
        INNER JOIN movie_genres mg ON m.id = mg.movie_id
        INNER JOIN genres g ON mg.genre_id = g.id
        WHERE g.name = ?`
      const params = [genre]
      const [movies] = await connection.query(query, params)
      return movies
    }
    if (title) {
      const query = (`SELECT BIN_TO_UUID(id) AS id, title, year, director, duration, poster, rate FROM movies
        WHERE title = ?`)
      const params = [title]
      const [movies] = await connection.query(query, params)
      return movies
    }
    const [movies] = await connection.query(
      'SELECT BIN_TO_UUID(id) AS id, title, year, director, duration, poster, rate FROM movies')
    return movies
  }

  static async getById ({ id }) {
    try {
      const [movie] = await connection.query(
      `SELECT BIN_TO_UUID(id) AS id, title, year, director, duration, poster, rate 
      FROM movies WHERE id = UUID_TO_BIN(?)`, [id])
      if (movie.length === 0) return false
      return movie
    } catch (error) {
      // return { error: true, message: `ID inválido: ${error.message}` }
      return false
    }
  }

  static async create ({ input }) {
    const { title, year, director, duration, poster, rate } = input
    const [result] = await connection.query(
      `INSERT INTO movies (title, year, director, duration, poster, rate)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [title, year, director, duration, poster, rate])

    if (result.affectedRows === 0) {
      return false
    }
    const newMovie = {
      id: result.insertId,
      title,
      year,
      director,
      duration,
      poster,
      rate
    }
    return newMovie
  }

  static async delete ({ id }) {
    const result = await connection.query(
      'DELETE FROM movies WHERE id = UUID_TO_BIN(?)', [id])
    if (result[0].affectedRows === 0) {
      return false
    }
    return true
  }

  static async update ({ id, input }) {
    // Verificar si la película existe
    const movie = await this.getById({ id })
    if (!movie || movie.length === 0) return false

    // Si no se proporcionan campos para actualizar, devolver la película sin cambios
    if (Object.keys(input).length === 0) {
      return movie[0]
    }

    // Construir la parte SET de la consulta SQL dinámicamente
    const fields = Object.keys(input).map(key => `${key} = ?`)
    const values = Object.values(input)
    values.push(id) // Agregar el id para la cláusula WHERE

    // Construir y ejecutar la consulta de actualización
    const query = `UPDATE movies SET ${fields.join(', ')} WHERE id = UUID_TO_BIN(?)`
    await connection.query(query, values)

    // Obtener y devolver la película actualizada
    const updatedMovie = await this.getById({ id })
    return updatedMovie[0]
  }
}
