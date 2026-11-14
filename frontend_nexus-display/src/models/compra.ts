import type { Almacen } from './almacen'
import type { DetalleCompra } from './detalle-compra'
import type { Proveedor } from './proveedor'
import type { Usuario } from './usuario'

export interface Compra {
  id: number
  idProveedor: number
  idUsuario: number
  fecha: string
  total: number
  proveedor: Proveedor
  usuario: Usuario
  almacen: Almacen
  detalles: DetalleCompra[]
}
