<script setup lang="ts">
import { OPCIONES_TRANSFERENCIA, QR_PAGO } from '@/config/pagos'
import { formatearMoneda } from '@/helpers'
import { generarPatronQr } from '@/helpers/qr'
import type { TipoPago } from '@/models/venta'
import { computed, ref, useId, watch } from 'vue'

/**
 * Panel de cobro que comparten la venta en mostrador y la compra a proveedor.
 * Recibe el método de pago y el total, y muestra lo que necesita el cajero:
 * el vuelto del efectivo, el QR para escanear o las cuentas para transferir.
 * Reutilizo las clases de cobro de app.css para que se vea igual que el carrito.
 */
const props = defineProps<{
  tipoPago: TipoPago
  total: number
  notaEfectivo?: string
}>()

const idRecibido = useId()
const recibido = ref<number | null>(null)
const opcionTransferencia = ref(OPCIONES_TRANSFERENCIA[0]?.id ?? '')
const qrConfirmado = ref(false)

const qrCeldas = computed(() => generarPatronQr())

const transferenciaSeleccionada = computed(
  () =>
    OPCIONES_TRANSFERENCIA.find((opcion) => opcion.id === opcionTransferencia.value) ??
    OPCIONES_TRANSFERENCIA[0],
)

// Redondeo a dos decimales para no arrastrar centavos de la resta.
const cambio = computed(() => {
  const monto = Number(recibido.value ?? 0)
  return monto > props.total ? Number((monto - props.total).toFixed(2)) : 0
})

const faltante = computed(() => {
  const monto = Number(recibido.value ?? 0)
  return monto < props.total ? Number((props.total - monto).toFixed(2)) : 0
})

// Si cambio de método de pago borro lo cargado para no arrastrar un vuelto o
// un QR confirmado de otro cobro.
function reiniciar() {
  recibido.value = null
  qrConfirmado.value = false
}

watch(() => props.tipoPago, reiniciar)

function simularPagoQr() {
  qrConfirmado.value = true
}

defineExpose({ cambio, reiniciar })
</script>

<template>
  <!-- Efectivo: anoto lo que entrega el cliente y muestro el vuelto -->
  <div v-if="tipoPago === 'EFECTIVO'" class="payment-panel">
    <label class="payment-panel__label" :for="idRecibido">Efectivo recibido (Bs.)</label>
    <input :id="idRecibido" v-model.number="recibido" type="number" min="0" step="0.5"
      class="form-control form-control-sm" placeholder="0.00" />

    <div class="payment-account mt-2">
      <div><span>Total a pagar</span><strong>{{ formatearMoneda(total) }}</strong></div>
      <div><span>Recibido</span><strong>{{ formatearMoneda(recibido ?? 0) }}</strong></div>
      <div :class="faltante > 0 ? 'text-danger' : 'text-success'">
        <span>{{ faltante > 0 ? 'Falta' : 'Cambio' }}</span>
        <strong>{{ formatearMoneda(faltante > 0 ? faltante : cambio) }}</strong>
      </div>
    </div>

    <p class="payment-note">
      {{ notaEfectivo || 'Cobra en caja y entrega el cambio al cliente.' }}
    </p>
  </div>

  <!-- Transferencia: opciones de cuenta del negocio -->
  <div v-else-if="tipoPago === 'TRANSFERENCIA BANCARIA'" class="payment-panel">
    <label class="payment-panel__label" :for="`${idRecibido}-cuenta`">Cuenta de destino</label>
    <select :id="`${idRecibido}-cuenta`" v-model="opcionTransferencia" class="form-select form-select-sm">
      <option v-for="opcion in OPCIONES_TRANSFERENCIA" :key="opcion.id" :value="opcion.id">
        {{ opcion.banco }}
      </option>
    </select>

    <div v-if="transferenciaSeleccionada" class="payment-account">
      <div><span>Cuenta</span><strong>{{ transferenciaSeleccionada.cuenta }}</strong></div>
      <div><span>Titular</span><strong>{{ transferenciaSeleccionada.titular }}</strong></div>
      <div><span>Importe</span><strong>{{ formatearMoneda(total) }}</strong></div>
    </div>

    <p class="payment-note">
      Pide el comprobante y verifica el depósito antes de guardar.
    </p>
  </div>

  <!-- QR / Yape: muestro el código en un recuadro para escanearlo -->
  <div v-else-if="tipoPago === 'QR / YAPE'" class="payment-panel">
    <div v-if="!qrConfirmado" class="qr-box">
      <div class="qr-demo" aria-hidden="true">
        <span v-for="(activa, indice) in qrCeldas" :key="indice" :class="{ 'is-on': activa }"></span>
      </div>
      <div class="qr-box__info">
        <strong>{{ QR_PAGO.etiqueta }}</strong>
        <span>Ref. {{ QR_PAGO.referencia }}</span>
        <span style="font-size: 1rem; color: var(--nexus-text)">{{ formatearMoneda(total) }}</span>
        <button type="button" class="btn btn-sm btn-outline-primary mt-1" @click="simularPagoQr">
          <i class="pi pi-qrcode me-1"></i>Confirmar pago con QR
        </button>
      </div>
    </div>

    <div v-else class="payment-success">
      <i class="pi pi-check-circle"></i>
      <div>
        <strong>Pago confirmado</strong>
        <span>{{ formatearMoneda(total) }} · {{ QR_PAGO.referencia }}</span>
      </div>
      <button type="button" class="btn btn-sm btn-link ms-auto" @click="qrConfirmado = false">
        Deshacer
      </button>
    </div>

    <p class="payment-note">{{ QR_PAGO.nota }}</p>
  </div>
</template>
