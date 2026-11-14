import type { Marca } from './marca'

export interface Modelo {
  id: number
  idMarca: number
  nombre: string
  fotografia: string
  marca: Marca
}
