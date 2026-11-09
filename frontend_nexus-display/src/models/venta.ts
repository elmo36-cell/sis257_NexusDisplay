import type { Usuario } from './usuario'

export interface Venta {
  id: number
  fecha: string
  cliente: string
  total: number
  idUsuario: number
  usuario?: Usuario
}
