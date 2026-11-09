import type { Venta } from './venta'
import type { Pantalla } from './pantalla'

export interface DetalleVenta {
  id: number
  idVenta: number
  idPantalla: number
  cantidad: number
  precioUnitario: number
  subtotal: number
  venta?: Venta
  pantalla?: Pantalla
}
