<script setup lang="ts">
import type { DetalleCompra } from '@/models/detalle-compra'
import http from '@/plugins/axios'
import { Button, InputText } from 'primevue'
import { computed, onMounted, ref } from 'vue'

const ENDPOINT = 'detalles-compra'
const detalles = ref<DetalleCompra[]>([])
const busqueda = ref<string>('')

const detallesFiltrados = computed(() => {
  return detalles.value.filter((d) => {
    const q = busqueda.value.toLowerCase()
    return (
      (d.pantalla?.nombre ?? '').toLowerCase().includes(q) ||
      (d.pantalla?.codigo ?? '').toLowerCase().includes(q) ||
      String(d.idCompra ?? d.compra?.id ?? '').includes(q)
    )
  })
})

async function obtenerLista() {
  detalles.value = await http.get(ENDPOINT).then((response) => response.data)
}

onMounted(() => {
  obtenerLista()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="m-0">Detalles de Compras</h2>
        <p class="text-muted small m-0 mt-1">
          Desglose de pantallas adquiridas a proveedores, cantidades ingresadas y costos unitarios.
        </p>
      </div>
      <Button type="button" label="Actualizar Lista" severity="secondary" @click="obtenerLista" />
    </div>

    <div class="col-12 col-md-6 pl-0 mt-3 mb-3">
      <InputText v-model="busqueda" type="text" placeholder="Buscar por pantalla, código SKU o Nro. de compra..."
        class="w-100" />
    </div>

    <table class="table table-hover align-middle bg-white shadow-sm rounded">
      <thead class="table-dark">
        <tr>
          <th>Nro.</th>
          <th>Compra #</th>
          <th>Código SKU</th>
          <th>Pantalla</th>
          <th>Cantidad Ingresada</th>
          <th>Costo Unitario</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(det, index) in detallesFiltrados" :key="det.id">
          <td>{{ index + 1 }}</td>
          <td class="fw-bold">#{{ det.idCompra || det.compra?.id }}</td>
          <td>{{ det.pantalla?.codigo || '-' }}</td>
          <td class="fw-semibold text-dark">{{ det.pantalla?.nombre }}</td>
          <td>
            <span class="badge bg-success text-white px-3 py-2 fw-bold">
              {{ det.cantidad }} {{ Number(det.cantidad) === 1 ? 'unidad' : 'unidades' }}
            </span>
          </td>
          <td>Bs. {{ Number(det.costoUnitario).toFixed(2) }}</td>
          <td class="fw-bold text-primary">
            Bs.
            {{
              det.subtotal
                ? Number(det.subtotal).toFixed(2)
                : (Number(det.cantidad) * Number(det.costoUnitario)).toFixed(2)
            }}
          </td>
        </tr>
        <tr v-if="detallesFiltrados.length === 0">
          <td colspan="7" class="text-center py-4">
            No hay detalles de compra registrados todavía.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
