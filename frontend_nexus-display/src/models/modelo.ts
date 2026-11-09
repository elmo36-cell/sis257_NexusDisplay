import type { Marca } from './marca'

export interface Modelo {
  id: number
  nombre: string
  idMarca: number
  marca?: Marca
}
