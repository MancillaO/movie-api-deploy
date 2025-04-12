import z from 'zod'

const MovieGenre = z.enum([
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Musical', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller', 'War', 'Western', 'Biography', 'Family',
  'History', 'Sport'
])

const movieSchema = z.object({
  title: z.string()
    .min(1, 'El título es obligatorio')
    .max(200, 'El título no debe exceder los 200 caracteres')
    .trim(),

  year: z.number()
    .int('El año debe ser un número entero')
    .min(1888, 'La primera película fue en 1888')
    .max(new Date().getFullYear() + 5, 'Año no válido o fuera de rango'),

  director: z.string()
    .min(1, 'El director es obligatorio')
    .max(100, 'El nombre del director es demasiado largo')
    .trim()
    .refine(val => /^[a-zA-Z\s.\-']+$/.test(val), {
      message: 'El nombre del director debe contener caracteres válidos'
    }),

  duration: z.number()
    .int('La duración debe ser un número entero')
    .positive('La duración debe ser un número positivo')
    .min(1, 'La duración mínima es 1 minuto')
    .max(600, 'La duración máxima permitida es de 10 horas'),

  poster: z.string()
    .url('La URL del póster debe ser válida')
    .refine(url => url.match(/\.(jpeg|jpg|gif|png|webp)$/i), {
      message: 'La URL debe apuntar a una imagen (jpeg, jpg, gif, png, webp)'
    }),

  rate: z.number()
    .min(0, 'La puntuación mínima es 0')
    .max(10, 'La puntuación máxima es 10')
    .optional()
    .transform(val => val === undefined ? 0 : parseFloat(val.toFixed(1))), // Redondea a 1 decimal

  genre: z.array(MovieGenre)
    .min(1, 'Se requiere al menos un género')
    .refine(genres => new Set(genres).size === genres.length, {
      message: 'No se permiten géneros duplicados'
    })
})

export function validateMovie (object) {
  return movieSchema.safeParse(object)
}

export function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object)
}
