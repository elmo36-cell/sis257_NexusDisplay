import type { Modelo } from './modelo'
import type { Calidad } from './calidad'
import type { Categoria } from './categoria'
import type { InventarioAlmacen } from './inventario-almacen'

export interface Pantalla {
  id: number
  idModelo: number
  idCalidad: number
  idCategoria: number
  nombre: string
  codigo: string
  color: string
  conMarco: boolean
  fotografia: string
  precioVenta: number
  modelo: Modelo
  calidad: Calidad
  categoria: Categoria
  inventarios?: InventarioAlmacen[]
}
