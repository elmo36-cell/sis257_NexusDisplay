<script setup lang="ts">
import type { Compra } from '@/models/compra'
import type { Proveedor } from '@/models/proveedor'
import type { Usuario } from '@/models/usuario'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, InputText, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'compras'
const props = defineProps({
  mostrar: Boolean,
  compra: { type: Object as () => Compra, default: () => ({}) as Compra },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const proveedores = ref<Proveedor[]>([])
const usuarios = ref<Usuario[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const compra = ref<Compra>({ ...props.compra })

async function cargarRelaciones() {
  proveedores.value = await http.get('proveedores').then((r) => r.data)
  usuarios.value = await http.get('usuarios').then((r) => r.data)
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      cargarRelaciones()
      if (props.compra?.id) {
        compra.value = {
          ...props.compra,
          idProveedor: props.compra.idProveedor || props.compra.proveedor?.id || 0,
          idUsuario: props.compra.idUsuario || props.compra.usuario?.id || 0,
        }
      } else {
        compra.value = { fecha: new Date().toISOString().split('T')[0], total: 0 } as Compra
      }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      fecha: compra.value.fecha,
      total: Number(compra.value.total),
      idProveedor: compra.value.idProveedor,
      idUsuario: compra.value.idUsuario,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${compra.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    compra.value = {} as Compra
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Compra' : 'Registrar Compra'"
      style="width: 28rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="proveedor" class="font-semibold w-3">Proveedor</label>
        <Select id="proveedor" v-model="compra.idProveedor" :options="proveedores" optionLabel="nombre" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="usuario" class="font-semibold w-3">Usuario</label>
        <Select id="usuario" v-model="compra.idUsuario" :options="usuarios" optionLabel="usuario" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="fecha" class="font-semibold w-3">Fecha</label>
        <InputText id="fecha" type="date" v-model="compra.fecha" class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="total" class="font-semibold w-3">Total (Bs)</label>
        <InputNumber id="total" v-model="compra.total" mode="decimal" :minFractionDigits="2" class="flex-auto" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
