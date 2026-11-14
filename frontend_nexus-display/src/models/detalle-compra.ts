import type { Compra } from './compra'
import type { Pantalla } from './pantalla'

export interface DetalleCompra {
  id: number
  idCompra: number
  idPantalla: number
  cantidad: number
  costoUnitario: number
  subtotal: number
  compra?: Compra
  pantalla?: Pantalla
}
