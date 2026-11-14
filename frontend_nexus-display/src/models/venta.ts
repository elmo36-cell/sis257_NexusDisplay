import type { Almacen } from './almacen'
import type { DetalleVenta } from './detalle-venta'
import type { Usuario } from './usuario'

export interface Venta {
  id: number
  idUsuario: number
  idAlmacen: number
  nombreCliente: string
  documentoCliente: string
  fecha: string
  total: number
  usuario: Usuario
  almacen: Almacen
  detalles: DetalleVenta[]
}
