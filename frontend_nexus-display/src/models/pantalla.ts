import type { Modelo } from './modelo'
import type { Calidad } from './calidad'
import type { Categoria } from './categoria'

export interface Pantalla {
  id: number
  nombre: string
  descripcion: string
  precio: number
  idModelo: number
  idCalidad: number
  idCategoria: number
  modelo?: Modelo
  calidad?: Calidad
  categoria?: Categoria
}
