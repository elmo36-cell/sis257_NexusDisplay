<script setup lang="ts">
import type { Almacen } from '@/models/almacen'
import type { Pantalla } from '@/models/pantalla'
import type { Usuario } from '@/models/usuario'
import http from '@/plugins/axios'
import { useAuthStore } from '@/stores'
import { Button, Dialog, InputNumber, InputText, Select } from 'primevue'
import { computed, ref, watch } from 'vue'
import type { AxiosError } from 'axios'

const authStore = useAuthStore()
const props = defineProps({ mostrar: Boolean })
const emit = defineEmits(['guardar', 'close'])

const almacenes = ref<Almacen[]>([])
const pantallas = ref<Pantalla[]>([])
const clientesRegistrados = ref<Usuario[]>([])

const idAlmacen = ref<number | null>(null)
const tipoCliente = ref<'SIN_REGISTRAR' | 'REGISTRADO'>('SIN_REGISTRAR')
const idClienteSeleccionado = ref<number | null>(null)
const nombreCliente = ref('S/N')
const documentoCliente = ref('0')

const mostrarFormNuevoCliente = ref(false)
const nuevoClienteUsuario = ref('')
const nuevoClienteCorreo = ref('')
const nuevoClienteTelefono = ref('')
const nuevoClienteClave = ref('')

const idPantalla = ref<number | null>(null)
const cantidad = ref<number>(1)
const detalles = ref<
  {
    idPantalla: number
    nombre: string
    cantidad: number
    precioUnitario: number
  }[]
>([])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    if (!value) emit('close')
  },
})

async function cargarDatos() {
  const [resAlm, resPan, resUsu] = await Promise.all([
    http.get('almacenes'),
    http.get('pantallas'),
    http.get('usuarios').catch(() => ({ data: [] })),
  ])
  almacenes.value = resAlm.data
  pantallas.value = resPan.data
  clientesRegistrados.value = (resUsu.data as Usuario[]).filter((u) => u.rol === 'CLIENTE')

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
      await cargarDatos()
      detalles.value = []
      tipoCliente.value = 'SIN_REGISTRAR'
      idClienteSeleccionado.value = null
      nombreCliente.value = 'S/N'
      documentoCliente.value = '0'
      mostrarFormNuevoCliente.value = false
      cantidad.value = 1
    }
  },
)

function alSeleccionarClienteRegistrado(idUsr: number | null) {
  const encontrado = clientesRegistrados.value.find((u) => u.id === idUsr)
  if (encontrado) {
    nombreCliente.value = encontrado.nombreUsuario
  }
}

// Al presionar el botón +: si la pantalla ya está en la lista, AUMENTA su cantidad
function agregarItem() {
  if (!idPantalla.value && detalles.value.length > 0) {
    // Si el selector quedó vacío pero ya hay un ítem en la lista, le suma +1 al último ítem agregado
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
  const existente = detalles.value.find((d) => d.idPantalla === p.id)

  if (existente) {
    existente.cantidad += cantAgregar
  } else {
    detalles.value.push({
      idPantalla: p.id,
      nombre: p.nombre,
      cantidad: cantAgregar,
      precioUnitario: Number(p.precioVenta),
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

async function registrarNuevoClienteRapido() {
  if (!nuevoClienteUsuario.value || !nuevoClienteCorreo.value || !nuevoClienteClave.value) {
    alert('Completa usuario, correo y contraseña para registrar al cliente.')
    return
  }
  try {
    const res = await http.post('usuarios', {
      nombreUsuario: nuevoClienteUsuario.value,
      correo: nuevoClienteCorreo.value,
      telefono: nuevoClienteTelefono.value,
      clave: nuevoClienteClave.value,
      rol: 'CLIENTE',
      activo: true,
    })
    const creado: Usuario = res.data
    clientesRegistrados.value.push(creado)
    tipoCliente.value = 'REGISTRADO'
    idClienteSeleccionado.value = creado.id
    nombreCliente.value = creado.nombreUsuario
    mostrarFormNuevoCliente.value = false
    nuevoClienteUsuario.value = ''
    nuevoClienteCorreo.value = ''
    nuevoClienteTelefono.value = ''
    nuevoClienteClave.value = ''
    alert(`Cliente "${creado.nombreUsuario}" registrado y seleccionado.`)
  } catch (error) {
    const err = error as AxiosError<{ message?: string | string[] }>
    const msg = Array.isArray(err.response?.data?.message)
      ? err.response?.data?.message.join(', ')
      : err.response?.data?.message
    alert(msg || 'Error al registrar el cliente')
  }
}

const totalVenta = computed(() =>
  detalles.value.reduce((acc, d) => acc + Number(d.cantidad) * Number(d.precioUnitario), 0),
)

async function handleSave() {
  if (!idAlmacen.value) {
    alert('Seleccione un almacén de salida.')
    return
  }
  if (detalles.value.length === 0) {
    alert('Agregue al menos una pantalla a la venta.')
    return
  }
  try {
    await http.post('ventas', {
      idUsuario: Number(authStore.userId || 1),
      idAlmacen: Number(idAlmacen.value),
      nombreCliente: nombreCliente.value.trim() || 'S/N',
      documentoCliente: documentoCliente.value.trim() || '0',
      detalles: detalles.value.map((d) => ({
        idVenta: 1,
        idPantalla: Number(d.idPantalla),
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario),
      })),
    })
    emit('guardar')
    dialogVisible.value = false
    alert('Venta registrada exitosamente')
  } catch (error) {
    const err = error as AxiosError<{ message?: string | string[] }>
    const msg = Array.isArray(err.response?.data?.message)
      ? err.response?.data?.message.join(', ')
      : err.response?.data?.message
    alert(msg || 'Error al registrar la venta')
  }
}
</script>

<template>
  <Dialog v-model:visible="dialogVisible" header="Registrar Nueva Venta" :style="{ width: '38rem' }" modal>
    <div class="d-flex flex-column gap-3 pt-2">
      <!-- Almacén -->
      <div>
        <label class="fw-semibold d-block mb-1">Almacén de Salida</label>
        <Select v-model="idAlmacen" :options="almacenes" optionLabel="nombre" optionValue="id"
          placeholder="Seleccione almacén" class="w-100" />
      </div>

      <!-- Opciones de Cliente: Sin registrar / Registrado / Nuevo Usuario -->
      <div class="p-3 rounded border">
        <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <div class="d-flex gap-3">
            <label class="d-flex align-items-center gap-1" style="cursor: pointer">
              <input type="radio" value="SIN_REGISTRAR" v-model="tipoCliente" @change="idClienteSeleccionado = null" />
              <span>Cliente sin registrar</span>
            </label>
            <label class="d-flex align-items-center gap-1" style="cursor: pointer">
              <input type="radio" value="REGISTRADO" v-model="tipoCliente" />
              <span>Cliente registrado</span>
            </label>
          </div>

          <Button type="button" :label="mostrarFormNuevoCliente ? 'Cancelar Registro' : 'Registrar Usuario Cliente'"
            size="small" severity="info" @click="mostrarFormNuevoCliente = !mostrarFormNuevoCliente" />
        </div>

        <!-- Formulario para crear usuario cliente ahí mismo -->
        <div v-if="mostrarFormNuevoCliente" class="p-3 mb-3 rounded border">
          <div class="fw-bold mb-2 small">Nuevo Usuario Cliente</div>
          <div class="row g-2">
            <div class="col-6">
              <InputText v-model="nuevoClienteUsuario" placeholder="Nombre de Usuario" class="w-100" />
            </div>
            <div class="col-6">
              <InputText v-model="nuevoClienteCorreo" placeholder="Correo electrónico" class="w-100" />
            </div>
            <div class="col-6">
              <InputText v-model="nuevoClienteTelefono" placeholder="Teléfono" class="w-100" />
            </div>
            <div class="col-6">
              <InputText v-model="nuevoClienteClave" type="password" placeholder="Contraseña (mín. 6)" class="w-100" />
            </div>
          </div>
          <div class="text-end mt-2">
            <Button type="button" label="Crear y Seleccionar Cliente" size="small"
              @click="registrarNuevoClienteRapido" />
          </div>
        </div>

        <!-- Selector de cliente registrado -->
        <div v-if="tipoCliente === 'REGISTRADO'" class="mb-2">
          <label class="fw-semibold d-block mb-1 small">Seleccionar Cliente Registrado</label>
          <Select v-model="idClienteSeleccionado" :options="clientesRegistrados" optionLabel="nombreUsuario"
            optionValue="id" placeholder="Seleccione un cliente..." class="w-100"
            @update:modelValue="alSeleccionarClienteRegistrado" />
        </div>

        <!-- Nombre y NIT/CI -->
        <div class="row g-2">
          <div class="col-12 col-md-7">
            <label class="fw-semibold d-block mb-1 small">Nombre Cliente</label>
            <InputText v-model="nombreCliente" class="w-100" placeholder="S/N" />
          </div>
          <div class="col-12 col-md-5">
            <label class="fw-semibold d-block mb-1 small">NIT / CI</label>
            <InputText v-model="documentoCliente" class="w-100" placeholder="0" />
          </div>
        </div>
      </div>

      <!-- Selección de Pantalla y Cantidad -->
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-6">
          <label class="fw-semibold d-block mb-1">Pantalla</label>
          <Select v-model="idPantalla" :options="pantallas" optionLabel="nombre" optionValue="id"
            placeholder="Seleccione pantalla" class="w-100" />
        </div>
        <div class="col-6 col-md-3">
          <label class="fw-semibold d-block mb-1">Cantidad a sumar</label>
          <InputNumber v-model="cantidad" :min="1" inputClass="w-100 text-center" class="w-100" />
        </div>
        <div class="col-6 col-md-3">
          <Button type="button" label="+ Añadir / Sumar" class="w-100" @click="agregarItem" />
        </div>
      </div>

      <!-- Lista de ítems con botones - y + para aumentar/disminuir cantidad -->
      <div v-if="detalles.length > 0" class="border rounded p-2">
        <div v-for="(item, idx) in detalles" :key="item.idPantalla"
          class="d-flex justify-content-between align-items-center border-bottom py-2 gap-2">
          <div class="flex-grow-1">
            <div class="fw-bold">{{ item.nombre }}</div>
            <div class="small text-muted">Bs. {{ item.precioUnitario.toFixed(2) }} c/u</div>
          </div>

          <div class="d-flex align-items-center gap-1">
            <Button type="button" label="-" size="small" severity="secondary" @click="cambiarCantidadItem(idx, -1)" />
            <span class="px-3 fw-bold">{{ item.cantidad }}</span>
            <Button type="button" label="+" size="small" severity="info" @click="cambiarCantidadItem(idx, 1)" />
          </div>

          <div class="fw-bold text-end" style="min-width: 90px">
            Bs. {{ (item.cantidad * item.precioUnitario).toFixed(2) }}
          </div>

          <Button type="button" label="Quitar" severity="danger" text size="small" @click="quitarItem(idx)" />
        </div>
      </div>

      <div class="text-end fw-bold fs-5">Total Venta: Bs. {{ totalVenta.toFixed(2) }}</div>

      <div class="d-flex justify-content-end gap-2">
        <Button type="button" label="Cancelar" severity="secondary" @click="dialogVisible = false" />
        <Button type="button" label="Guardar Venta" :disabled="detalles.length === 0" @click="handleSave" />
      </div>
    </div>
  </Dialog>
</template>
