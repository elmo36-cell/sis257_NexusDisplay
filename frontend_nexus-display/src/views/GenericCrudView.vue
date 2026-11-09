<template>
  <div class="container py-5 mt-4">
    <!-- Cabecera de la vista con mejor distribución -->
    <div class="row align-items-center mb-4">
      <div class="col-sm-8">
        <h2 class="fw-bold text-dark mb-1">
          <i class="fa fa-folder-open text-primary me-2"></i> Módulo de {{ title }}
        </h2>
        <p class="text-muted mb-0">Administración y control de registros para J&A Repuestos</p>
      </div>
      <div class="col-sm-4 text-sm-end mt-3 mt-sm-0">
        <button class="btn btn-primary px-4 py-2 shadow-sm rounded-pill fw-semibold" @click="abrirModalCrear">
          <i class="fa fa-plus-circle me-2"></i> Crear Nuevo
        </button>
      </div>
    </div>

    <!-- Contenedor de la Tabla con Tarjeta y Sombra -->
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      <div class="card-body p-0">
        <DataTable :value="items" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20, 50]"
          tableStyle="min-width: 50rem" class="p-datatable-custom">
          <!-- Mensaje vacío -->
          <template #empty>
            <div class="text-center py-5 text-muted">
              <i class="fa fa-inbox fa-3x mb-3 opacity-50"></i>
              <p class="mb-0">No se encontraron registros disponibles.</p>
            </div>
          </template>

          <!-- Columnas dinámicas -->
          <Column v-for="col in columns" :key="col" :field="col" :header="formatearHeader(col)" sortable>
            <template #body="slotProps">
              <span class="text-secondary fw-medium">{{ slotProps.data[col] }}</span>
            </template>
          </Column>

          <!-- Columna de Acciones con separación -->
          <Column header="Acciones" style="width: 140px; text-align: center;">
            <template #body="slotProps">
              <div class="d-flex justify-content-center gap-2 py-1">
                <button
                  class="btn btn-sm btn-outline-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style="width: 35px; height: 35px;" @click="editarItem(slotProps.data)" title="Editar">
                  <i class="fa fa-edit"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style="width: 35px; height: 35px;" @click="eliminarItem(slotProps.data.id)" title="Eliminar">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '@/plugins/axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps<{ endpoint: string; title: string }>();

const items = ref<any[]>([]);
const columns = ref<string[]>([]);

const fetchData = async () => {
  try {
    const response = await api.get(`/${props.endpoint}`);
    items.value = response.data;

    if (items.value.length > 0) {
      columns.value = Object.keys(items.value[0]).filter(key => key !== 'password' && key !== 'clave');
    } else {
      columns.value = ['id', 'nombre'];
    }
  } catch (error) {
    console.error(`Error al cargar los datos de ${props.endpoint}:`, error);
  }
};

const formatearHeader = (col: string) => {
  return col.replace(/([A-Z])/g, ' $1').toUpperCase();
};

const abrirModalCrear = () => {
  console.log('Crear nuevo registro');
};

const editarItem = (item: any) => {
  console.log('Editar item:', item);
};

const eliminarItem = async (id: number) => {
  if (confirm('¿Estás seguro de eliminar este registro?')) {
    try {
      await api.delete(`/${props.endpoint}/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  }
};

onMounted(fetchData);
watch(() => props.endpoint, fetchData);
</script>

<style scoped>
/* Estilos modernos y limpios para la tabla */
.card {
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05) !important;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #506a84;
  color: #495057;
  font-weight: 700;
  border-bottom: 2px solid #0e6ece;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
  border-bottom: 1px solid #2b5885;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f8f9fa;
}

:deep(.p-paginator) {
  background-color: #7e5252;
  border-top: 1px solid #4c76a0;
  padding: 0.75rem;
}
</style>
