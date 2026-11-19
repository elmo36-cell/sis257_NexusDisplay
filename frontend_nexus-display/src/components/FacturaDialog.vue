<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import { formatearFecha, formatearMoneda } from '@/helpers'
import type { Venta } from '@/models/venta'

const props = defineProps<{
  visible: boolean
  venta: Venta | null
}>()

const emit = defineEmits(['update:visible'])

const abierto = computed({
  get: () => props.visible,
  set: (valor: boolean) => emit('update:visible', valor),
})

const etiquetasPago: Record<string, string> = {
  'TRANSFERENCIA BANCARIA': 'Transferencia bancaria',
  'QR / YAPE': 'Pago con QR / Yape',
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
}

/** Pasa el código de pago (EFECTIVO, QR / YAPE...) a un texto entendible. */
const tipoPago = computed(() => {
  if (!props.venta?.tipoPago) return 'No registrado'
  return etiquetasPago[props.venta.tipoPago] ?? props.venta.tipoPago
})

/** Sumo las cantidades de los detalles para mostrar el total de unidades. */
const totalUnidades = computed(() =>
  (props.venta?.detalles ?? []).reduce((acc, detalle) => acc + Number(detalle.cantidad || 0), 0),
)

/** Abre la impresión del navegador para imprimir la factura. */
function imprimir() {
  window.print()
}
</script>

<template>
  <Dialog v-model:visible="abierto" header="Factura de venta" :style="{ width: '30rem' }" modal>
    <div v-if="venta" class="factura-print-area">
      <div class="factura-encabezado">
        <div>
          <div class="factura-marca">NEXUS DISPLAY</div>
          <div class="factura-marca__sub">Pantallas y repuestos para celulares</div>
        </div>
        <div class="factura-numero">
          <span>Factura</span>
          <strong>#{{ String(venta.id).padStart(5, '0') }}</strong>
        </div>
      </div>

      <div class="factura-datos">
        <div><span>Fecha</span><strong>{{ formatearFecha(venta.fecha) }}</strong></div>
        <div><span>Cliente</span><strong>{{ venta.nombreCliente || 'S/N' }}</strong></div>
        <div><span>NIT / CI</span><strong>{{ venta.documentoCliente || '—' }}</strong></div>
        <div><span>Sucursal</span><strong>{{ venta.almacen?.nombre || '—' }}</strong></div>
        <div><span>Atendido por</span><strong>{{ venta.usuario?.nombreUsuario || '—' }}</strong></div>
        <div><span>Forma de pago</span><strong>{{ tipoPago }}</strong></div>
      </div>

      <table class="factura-tabla">
        <thead>
          <tr>
            <th>Descripción</th>
            <th class="text-center">Cant.</th>
            <th class="text-end">P. Unitario</th>
            <th class="text-end">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="detalle in venta.detalles" :key="detalle.id">
            <td>
              {{ detalle.pantalla?.nombre || 'Pantalla' }}
              <small v-if="detalle.pantalla?.codigo">SKU {{ detalle.pantalla.codigo }}</small>
            </td>
            <td class="text-center">{{ detalle.cantidad }}</td>
            <td class="text-end">{{ formatearMoneda(detalle.precioUnitario) }}</td>
            <td class="text-end">
              {{ formatearMoneda(detalle.subtotal || detalle.cantidad * detalle.precioUnitario) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="factura-totales">
        <div><span>Unidades</span><span>{{ totalUnidades }}</span></div>
        <div class="factura-total"><span>Total</span><span>{{ formatearMoneda(venta.total) }}</span></div>
      </div>

      <p class="factura-pie">
        Gracias por su compra. Comprobante interno de control · Nexus Display.
      </p>
    </div>

    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary" @click="abierto = false">Cerrar</button>
        <button type="button" class="btn btn-primary" @click="imprimir">
          <i class="pi pi-print me-1"></i>Imprimir
        </button>
      </div>
    </template>
  </Dialog>
</template>
