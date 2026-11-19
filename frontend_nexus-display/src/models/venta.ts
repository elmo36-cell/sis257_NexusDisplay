import type { Almacen } from './almacen'
import type { DetalleVenta } from './detalle-venta'
import type { Usuario } from './usuario'

// Valores del enum TipoPago del backend (src/ventas/enums/tipo-pago.enum.ts).
export type TipoPago = 'EFECTIVO' | 'QR / YAPE' | 'TRANSFERENCIA BANCARIA' | 'TARJETA'

export interface Venta {
  id: number
  idUsuario: number
  idAlmacen: number
  nombreCliente: string
  documentoCliente: string
  tipoPago?: TipoPago | null
  fecha: string
  total: number
  usuario: Usuario
  almacen: Almacen
  detalles: DetalleVenta[]
}
