<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import clienteApi from '@/plugins/axios'
import { aFechaLocal, formatearFecha, formatearMoneda } from '@/helpers'
import { mensajeDeError, notify } from '@/helpers/notificaciones'
import type { Compra } from '@/models/compra'

const RUTA_API = 'compras'

const props = defineProps<{
  visible: boolean
  compra: Compra | null
}>()

const emit = defineEmits(['update:visible', 'actualizada'])

const abierto = computed({
  get: () => props.visible,
  set: (valor: boolean) => emit('update:visible', valor),
})

// La fecha se edita con un input datetime-local, así que la paso a formato
// "aaaa-mm-ddThh:mm" en hora local (si uso toISOString me la corre de zona).
const fechaEditable = ref('')
const guardando = ref(false)

// Al abrir la factura de otra compra, cargo su fecha en el campo editable.
watch(
  () => props.compra,
  (compra) => {
    fechaEditable.value = aFechaLocal(compra?.fecha)
  },
  { immediate: true },
)

/** Sumo las cantidades del detalle para mostrar el total de unidades compradas. */
const totalUnidades = computed(() =>
  (props.compra?.detalles ?? []).reduce((acc, detalle) => acc + Number(detalle.cantidad || 0), 0),
)

/**
 * Guardo la fecha corregida. Es lo único editable de la compra al proveedor,
 * por eso el PATCH manda solo ese campo.
 */
async function guardarFecha() {
  if (!props.compra?.id || !fechaEditable.value) {
    notify.warn('Selecciona una fecha válida para la compra')
    return
  }
  guardando.value = true
  try {
    await clienteApi.patch(`${RUTA_API}/${props.compra.id}`, { fecha: fechaEditable.value })
    emit('actualizada')
    abierto.value = false
    notify.success('Fecha de la compra actualizada')
  } catch (error) {
    notify.error(mensajeDeError(error, 'No se pudo actualizar la fecha de la compra'))
  } finally {
    guardando.value = false
  }
}

/** Abre la impresión del navegador para imprimir la factura de compra. */
function imprimir() {
  window.print()
}
</script>

<template>
  <Dialog v-model:visible="abierto" header="Factura de compra" :style="{ width: '30rem' }" modal>
    <div v-if="compra" class="factura-print-area">
      <div class="factura-encabezado">
        <div>
          <div class="factura-marca">NEXUS DISPLAY</div>
          <div class="factura-marca__sub">Compra a proveedor</div>
        </div>
        <div class="factura-numero">
          <span>Factura</span>
          <strong>#{{ String(compra.id).padStart(5, '0') }}</strong>
        </div>
      </div>

      <div class="factura-datos">
        <div>
          <span>Fecha de compra</span>
          <input v-model="fechaEditable" class="form-control form-control-sm factura-fecha-editable"
            type="datetime-local" />
          <strong class="factura-fecha-impresa">{{ formatearFecha(fechaEditable) }}</strong>
          <small class="factura-nota">Solo la compra al proveedor permite corregir la fecha.</small>
        </div>
        <div><span>Proveedor</span><strong>{{ compra.proveedor?.nombre || '—' }}</strong></div>
        <div><span>NIT</span><strong>{{ compra.proveedor?.nit || '—' }}</strong></div>
        <div><span>Teléfono</span><strong>{{ compra.proveedor?.telefono || '—' }}</strong></div>
        <div><span>Dirección</span><strong>{{ compra.proveedor?.direccion || '—' }}</strong></div>
        <div><span>Almacén destino</span><strong>{{ compra.almacen?.nombre || '—' }}</strong></div>
        <div><span>Registrado por</span><strong>{{ compra.usuario?.nombreUsuario || '—' }}</strong></div>
        <div><span>Fecha registrada</span><strong>{{ formatearFecha(compra.fecha) }}</strong></div>
      </div>

      <table class="factura-tabla">
        <thead>
          <tr>
            <th>Descripción</th>
            <th class="text-center">Cant.</th>
            <th class="text-end">Costo unit.</th>
            <th class="text-end">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="detalle in compra.detalles" :key="detalle.id">
            <td>
              {{ detalle.pantalla?.nombre || 'Pantalla' }}
              <small v-if="detalle.pantalla?.codigo">SKU {{ detalle.pantalla.codigo }}</small>
            </td>
            <td class="text-center">{{ detalle.cantidad }}</td>
            <td class="text-end">{{ formatearMoneda(detalle.costoUnitario) }}</td>
            <td class="text-end">
              {{ formatearMoneda(detalle.subtotal || detalle.cantidad * detalle.costoUnitario) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="factura-totales">
        <div><span>Unidades</span><span>{{ totalUnidades }}</span></div>
        <div class="factura-total"><span>Total</span><span>{{ formatearMoneda(compra.total) }}</span></div>
      </div>

      <p class="factura-pie">
        Comprobante interno de compra a proveedor · Nexus Display.
      </p>
    </div>

    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-outline-secondary" @click="abierto = false">Cerrar</button>
        <button type="button" class="btn btn-outline-primary" @click="imprimir">
          <i class="pi pi-print me-1"></i>Imprimir
        </button>
        <button type="button" class="btn btn-primary" :disabled="guardando" @click="guardarFecha">
          <i class="pi pi-save me-1"></i>Guardar fecha
        </button>
      </div>
    </template>
  </Dialog>
</template>
