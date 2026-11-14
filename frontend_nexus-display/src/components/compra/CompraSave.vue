<script setup lang="ts">
import type { Proveedor } from '@/models/proveedor'
import type { Almacen } from '@/models/almacen'
import type { Pantalla } from '@/models/pantalla'
import http from '@/plugins/axios'
import { useAuthStore } from '@/stores'
import { Button, Dialog, InputNumber, Select } from 'primevue'
import { computed, ref, watch } from 'vue'
import type { AxiosError } from 'axios'

const authStore = useAuthStore()
const props = defineProps({ mostrar: Boolean })
const emit = defineEmits(['guardar', 'close'])

const proveedores = ref<Proveedor[]>([])
const almacenes = ref<Almacen[]>([])
const pantallas = ref<Pantalla[]>([])

const idProveedor = ref<number | null>(null)
const idAlmacen = ref<number | null>(null)
const idPantalla = ref<number | null>(null)
const cantidad = ref<number>(1)
const costoUnitario = ref<number>(100)

const detalles = ref<
  {
    idPantalla: number
    nombre: string
    cantidad: number
    costoUnitario: number
  }[]
>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function cargarListas() {
  const [resProv, resAlm, resPan] = await Promise.all([
    http.get('proveedores'),
    http.get('almacenes'),
    http.get('pantallas'),
  ])
  proveedores.value = resProv.data
  almacenes.value = resAlm.data
  pantallas.value = resPan.data

  if (proveedores.value.length > 0 && !idProveedor.value) {
    idProveedor.value = proveedores.value[0]?.id ?? null
  }
  if (almacenes.value.length > 0 && !idAlmacen.value) {
    idAlmacen.value = almacenes.value[0]?.id ?? null
  }
  if (pantallas.value.length > 0 && !idPantalla.value) {
    idPantalla.value = pantallas.value[0]?.id ?? null
  }
}

watch(
  () => props.mostrar,
  async (val) => {
    if (val) {
      await cargarListas()
      detalles.value = []
      cantidad.value = 1
      costoUnitario.value = 100
    }
  },
)

function agregarItem() {
  if (!idPantalla.value && detalles.value.length > 0) {
    const ultimo = detalles.value[detalles.value.length - 1]
    if (ultimo) {
      ultimo.cantidad += Number(cantidad.value) || 1
    }
    return
  }

  const p = pantallas.value.find((x) => x.id === idPantalla.value)
  if (!p) {
    alert('Seleccione una pantalla de la lista.')
    return
  }

  const cantAgregar = Number(cantidad.value) || 1
  const costo = Number(costoUnitario.value) || 1
  const existente = detalles.value.find((d) => d.idPantalla === p.id)

  if (existente) {
    existente.cantidad += cantAgregar
    existente.costoUnitario = costo
  } else {
    detalles.value.push({
      idPantalla: p.id,
      nombre: p.nombre,
      cantidad: cantAgregar,
      costoUnitario: costo,
    })
  }

  cantidad.value = 1
}

function cambiarCantidadItem(index: number, delta: number) {
  const item = detalles.value[index]
  if (!item) return
  const nueva = item.cantidad + delta
  if (nueva >= 1) {
    item.cantidad = nueva
  }
}

function quitarItem(index: number) {
  detalles.value.splice(index, 1)
}

const totalCompra = computed(() =>
  detalles.value.reduce((acc, d) => acc + Number(d.cantidad) * Number(d.costoUnitario), 0),
)

async function handleSave() {
  if (!idProveedor.value || !idAlmacen.value) {
    alert('Seleccione un proveedor y un almacén receptor.')
    return
  }
  if (detalles.value.length === 0) {
    alert('Agregue al menos una pantalla a la compra.')
    return
  }

  try {
    await http.post('compras', {
      idProveedor: Number(idProveedor.value),
      idUsuario: Number(authStore.userId || 1),
      idAlmacen: Number(idAlmacen.value),
      detalles: detalles.value.map((d) => ({
        idCompra: 1,
        idPantalla: Number(d.idPantalla),
        cantidad: Number(d.cantidad),
        costoUnitario: Number(d.costoUnitario),
      })),
    })
    emit('guardar')
    dialogVisible.value = false
    alert('Compra registrada y stock actualizado exitosamente')
  } catch (error) {
    const err = error as AxiosError<{ message?: string | string[] }>
    const msg = Array.isArray(err.response?.data?.message)
      ? err.response?.data?.message.join(', ')
      : err.response?.data?.message
    alert(msg || 'Error al registrar la compra')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" header="Registrar Compra a Proveedor" :style="{ width: '38rem' }" modal>
    <div class="d-flex flex-column gap-3 pt-2">
      <div class="row g-2">
        <div class="col-12 col-md-6">
          <label class="fw-semibold d-block mb-1">Proveedor</label>
          <Select v-model="idProveedor" :options="proveedores" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione proveedor" class="w-100" />
        </div>
        <div class="col-12 col-md-6">
          <label class="fw-semibold d-block mb-1">Almacén Receptor</label>
          <Select v-model="idAlmacen" :options="almacenes" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione almacén" class="w-100" />
        </div>
      </div>

      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-5">
          <label class="fw-semibold d-block mb-1">Pantalla</label>
          <Select v-model="idPantalla" :options="pantallas" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione pantalla" class="w-100" />
        </div>
        <div class="col-6 col-md-2">
          <label class="fw-semibold d-block mb-1">Cantidad</label>
          <InputNumber v-model="cantidad" :min="1" inputClass="w-100 text-center" class="w-100" />
        </div>
        <div class="col-6 col-md-3">
          <label class="fw-semibold d-block mb-1">Costo Unit. (Bs.)</label>
          <InputNumber v-model="costoUnitario" :min="1" mode="decimal" :minFractionDigits="2" inputClass="w-100"
            class="w-100" />
        </div>
        <div class="col-12 col-md-2">
          <Button type="button" label="+ Añadir" class="w-100" @click="agregarItem" />
        </div>
      </div>

      <div v-if="detalles.length > 0" class="border rounded p-2">
        <div v-for="(item, idx) in detalles" :key="item.idPantalla"
          class="d-flex justify-content-between align-items-center border-bottom py-2 gap-2">
          <div class="flex-grow-1">
            <div class="fw-bold">{{ item.nombre }}</div>
            <div class="small text-muted">Costo Unit.: Bs. {{ item.costoUnitario.toFixed(2) }}</div>
          </div>

          <div class="d-flex align-items-center gap-1">
            <Button type="button" label="-" size="small" severity="secondary" @click="cambiarCantidadItem(idx, -1)" />
            <span class="px-3 fw-bold">{{ item.cantidad }}</span>
            <Button type="button" label="+" size="small" severity="info" @click="cambiarCantidadItem(idx, 1)" />
          </div>

          <div class="fw-bold text-end" style="min-width: 95px">
            Bs. {{ (item.cantidad * item.costoUnitario).toFixed(2) }}
          </div>

          <Button type="button" label="Quitar" severity="danger" text size="small" @click="quitarItem(idx)" />
        </div>
      </div>

      <div class="text-end fw-bold fs-5">Total Compra: Bs. {{ totalCompra.toFixed(2) }}</div>

      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar Compra" :disabled="detalles.length === 0" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
