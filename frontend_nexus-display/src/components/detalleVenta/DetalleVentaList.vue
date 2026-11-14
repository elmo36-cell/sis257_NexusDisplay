<script setup lang="ts">
import type { DetalleVenta } from '@/models/detalle-venta'
import http from '@/plugins/axios'
import { InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'detalles-venta'
const detalles = ref<DetalleVenta[]>([])
const busqueda = ref<string>('')

const detallesFiltrados = computed(() => {
  return detalles.value.filter((d) => {
    const q = busqueda.value.toLowerCase()
    return (
      (d.pantalla?.nombre ?? '').toLowerCase().includes(q) ||
      (d.pantalla?.codigo ?? '').toLowerCase().includes(q) ||
      (d.venta?.nombreCliente ?? '').toLowerCase().includes(q) ||
      String(d.idVenta ?? '').includes(q)
    )
  })
})

async function obtenerLista() {
  detalles.value = await http.get(ENDPOINT).then((response) => response.data)
}

onMounted(() => {
  obtenerLista()
})
defineExpose({ obtenerLista })
</script>

<template>
  <div>
    <div class="col-12 col-md-6 pl-0 mt-3 mb-3">
      <InputText v-model="busqueda" type="text"
        placeholder="Buscar por pantalla, código SKU, cliente o Nro. de venta..." class="w-100" />
    </div>

    <table class="table table-hover align-middle bg-white shadow-sm rounded">
      <thead class="table-dark">
        <tr>
          <th>Nro.</th>
          <th>Venta #</th>
          <th>Cliente</th>
          <th>Código SKU</th>
          <th>Pantalla Vendida</th>
          <th>Cantidad</th>
          <th>Precio Unitario</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(det, index) in detallesFiltrados" :key="det.id">
          <td>{{ index + 1 }}</td>
          <td class="fw-bold">#{{ det.idVenta || det.venta?.id }}</td>
          <td>{{ det.venta?.nombreCliente || 'S/N' }}</td>
          <td>{{ det.pantalla?.codigo || '-' }}</td>
          <td class="fw-semibold text-dark">{{ det.pantalla?.nombre }}</td>
          <td>
            <span class="badge bg-info text-dark px-3 py-2 fw-bold">
              {{ det.cantidad }} {{ Number(det.cantidad) === 1 ? 'unidad' : 'unidades' }}
            </span>
          </td>
          <td>Bs. {{ Number(det.precioUnitario).toFixed(2) }}</td>
          <td class="fw-bold text-primary">
            Bs.
            {{
              det.subtotal
                ? Number(det.subtotal).toFixed(2)
                : (Number(det.cantidad) * Number(det.precioUnitario)).toFixed(2)
            }}
          </td>
        </tr>
        <tr v-if="detallesFiltrados.length === 0">
          <td colspan="8" class="text-center py-4">
            No hay detalles de venta registrados todavía.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
