import type { Pantalla } from './pantalla'
import type { Almacen } from './almacen'

export interface InventarioAlmacen {
  id: number
  idPantalla: number
  idAlmacen: number
  stock: number
  pantalla?: Pantalla
  almacen?: Almacen
}
