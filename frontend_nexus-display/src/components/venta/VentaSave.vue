<script setup lang="ts">
import type { Usuario } from '@/models/usuario'
import type { Venta } from '@/models/venta'
import http from '@/plugins/axios'
import { Button, Dialog, InputNumber, InputText, Select } from 'primevue'
import { computed, ref, watch } from 'vue'

const ENDPOINT = 'ventas'
const props = defineProps({
  mostrar: Boolean,
  venta: { type: Object as () => Venta, default: () => ({}) as Venta },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const usuarios = ref<Usuario[]>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

const venta = ref<Venta>({ ...props.venta })

async function cargarUsuarios() {
  usuarios.value = await http.get('usuarios').then((r) => r.data)
}

watch(
  () => props.mostrar,
  (nuevoValor) => {
    if (nuevoValor) {
      cargarUsuarios()
      if (props.venta?.id) {
        venta.value = {
          ...props.venta,
          idUsuario: props.venta.idUsuario || props.venta.usuario?.id || 0,
        }
      } else {
        venta.value = { fecha: new Date().toISOString().split('T')[0], total: 0 } as Venta
      }
    }
  },
)

async function handleSave() {
  try {
    const body = {
      fecha: venta.value.fecha,
      cliente: venta.value.cliente,
      total: Number(venta.value.total),
      idUsuario: venta.value.idUsuario,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${venta.value.id}`, body)
    } else {
      await http.post(ENDPOINT, body)
    }
    emit('guardar')
    dialogVisible.value = false
  } catch (error: any) {
    alert(error?.response?.data?.message || 'Error al guardar')
  }
}
</script>

<template>
  <div class="card flex justify-center">
    <Dialog v-model:visible="dialogVisible" :header="props.modoEdicion ? 'Editar Venta' : 'Registrar Venta'"
      style="width: 28rem">
      <div class="flex items-center gap-4 mb-4">
        <label for="cliente" class="font-semibold w-3">Cliente</label>
        <InputText id="cliente" v-model="venta.cliente" class="flex-auto" autofocus />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="usuario" class="font-semibold w-3">Vendedor</label>
        <Select id="usuario" v-model="venta.idUsuario" :options="usuarios" optionLabel="usuario" optionValue="id"
          class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="fecha" class="font-semibold w-3">Fecha</label>
        <InputText id="fecha" type="date" v-model="venta.fecha" class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="total" class="font-semibold w-3">Total (Bs)</label>
        <InputNumber id="total" v-model="venta.total" mode="decimal" :minFractionDigits="2" class="flex-auto" />
      </div>
      <div class="flex justify-end gap-2">
        <Button type="button" label="Cancelar" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar" icon="pi pi-save" @click="handleSave" />
      </div>
    </Dialog>
  </div>
</template>
