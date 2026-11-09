import type { Proveedor } from './proveedor'
import type { Usuario } from './usuario'

export interface Compra {
  id: number
  fecha: string
  total: number
  idProveedor: number
  idUsuario: number
  proveedor?: Proveedor
  usuario?: Usuario
}
