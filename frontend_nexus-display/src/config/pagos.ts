import type { TipoPago } from '@/models/venta'

/**
 * Configuración de cobros de Nexus Display.
 * Reemplaza cuentas y titulares por los datos reales del negocio.
 */

export interface OpcionTransferencia {
  id: string
  banco: string
  cuenta: string
  titular: string
}

export const OPCIONES_TRANSFERENCIA: OpcionTransferencia[] = [
  {
    id: 'union',
    banco: 'Banco Unión',
    cuenta: '10000012345678',
    titular: 'Nexus Display S.R.L.',
  },
  {
    id: 'mercantil',
    banco: 'Banco Mercantil Santa Cruz',
    cuenta: '20000098765432',
    titular: 'Nexus Display S.R.L.',
  },
  {
    id: 'bnb',
    banco: 'Banco Nacional de Bolivia',
    cuenta: '30000045678901',
    titular: 'Nexus Display S.R.L.',
  },
]

export const QR_PAGO = {
  etiqueta: 'QR de pago genérico',
  referencia: 'NEXUS-DEMO',
  nota: 'Pago simulado con fines de demostración: se marca como exitoso al confirmarlo.',
}

export interface MetodoPago {
  etiqueta: string
  valor: TipoPago
}

// Métodos que ofrezco al cobrar en mostrador y al pagar una compra a proveedor.
export const METODOS_PAGO: MetodoPago[] = [
  { etiqueta: 'Efectivo', valor: 'EFECTIVO' },
  { etiqueta: 'Transferencia bancaria', valor: 'TRANSFERENCIA BANCARIA' },
  { etiqueta: 'QR / Yape', valor: 'QR / YAPE' },
]
