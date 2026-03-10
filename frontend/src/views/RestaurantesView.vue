<template>
  <div>
    <div class="page-header">
      <h1>Restaurantes</h1>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo Restaurante</button>
    </div>

    <div class="filters">
      <input v-model="filterNombre" placeholder="Buscar por nombre..." @input="load" />
      <select v-model="filtroActivo" @change="load">
        <option value="">Todos</option>
        <option value="true">Solo activos</option>
        <option value="false">Solo inactivos</option>
      </select>
      <button class="btn btn-sm" @click="showNearby = true">Buscar cercanos</button>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>

    <DataTable :columns="columns" :items="items" :skip="skip" :limit="limit" :total="total" @page-change="onPageChange">
      <template #toolbar="{ selected, count }">
        <button class="btn btn-sm" :disabled="count !== 1" @click="openEdit(selected[0])">Editar</button>
        <button class="btn btn-sm btn-danger" :disabled="count === 0" @click="confirmDeleteSelected(selected)">Eliminar{{ count > 0 ? ` (${count})` : '' }}</button>
      </template>
    </DataTable>

    <ModalForm v-if="showForm" :title="editing ? 'Editar Restaurante' : 'Nuevo Restaurante'" @close="showForm = false" width="600px">
      <form @submit.prevent="confirmSave">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" required />
        </div>
        <div class="form-group">
          <label>Dirección</label>
          <input v-model="form.direccion" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Longitud</label>
            <input v-model.number="form.longitud" type="number" step="any" required />
          </div>
          <div class="form-group">
            <label>Latitud</label>
            <input v-model.number="form.latitud" type="number" step="any" required />
          </div>
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input v-model="form.telefono" />
        </div>
        <div class="form-group">
          <label>Correo Contacto</label>
          <input v-model="form.correoContacto" type="email" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Apertura</label>
            <input v-model="form.apertura" placeholder="09:00" />
          </div>
          <div class="form-group">
            <label>Cierre</label>
            <input v-model="form.cierre" placeholder="22:00" />
          </div>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="rest-activo" v-model="form.activo" />
          <label for="rest-activo">Activo</label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" @click="showForm = false">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ editing ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </form>
    </ModalForm>

    <ModalForm v-if="showNearby" title="Restaurantes Cercanos" @close="showNearby = false" width="600px">
      <div class="form-row">
        <div class="form-group">
          <label>Longitud</label>
          <input v-model.number="nearbyLng" type="number" step="any" />
        </div>
        <div class="form-group">
          <label>Latitud</label>
          <input v-model.number="nearbyLat" type="number" step="any" />
        </div>
        <div class="form-group">
          <label>Radio (m)</label>
          <input v-model.number="nearbyRadius" type="number" />
        </div>
      </div>
      <button class="btn btn-primary" @click="searchNearby">Buscar</button>
      <div v-if="nearbyResults.length" class="nearby-results">
        <div v-for="r in nearbyResults" :key="r._id" class="nearby-item">
          <strong>{{ r.nombre }}</strong> - {{ r.direccion || 'Sin dirección' }}
        </div>
      </div>
    </ModalForm>

    <ConfirmModal
      v-if="confirmAction"
      :title="confirmAction.title"
      :message="confirmAction.message"
      :confirmText="confirmAction.confirmText"
      :danger="confirmAction.danger"
      @confirm="executeConfirm"
      @cancel="confirmAction = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import DataTable from '../components/DataTable.vue'
import ModalForm from '../components/ModalForm.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const items = ref([])
const skip = ref(0)
const limit = 20
const total = ref(0)
const error = ref('')
const filterNombre = ref('')
const filtroActivo = ref('')
const confirmAction = ref(null)

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'direccion', label: 'Dirección' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'activo', label: 'Activo' },
  { key: 'horario.apertura', label: 'Apertura' },
  { key: 'horario.cierre', label: 'Cierre' },
]

const showForm = ref(false)
const editing = ref(null)
const form = ref({})

const showNearby = ref(false)
const nearbyLng = ref(-90.55)
const nearbyLat = ref(14.63)
const nearbyRadius = ref(5000)
const nearbyResults = ref([])

function resetForm() {
  form.value = { nombre: '', direccion: '', longitud: -90.55, latitud: 14.63, telefono: '', correoContacto: '', apertura: '09:00', cierre: '22:00', activo: true }
}

function openCreate() { editing.value = null; resetForm(); showForm.value = true }

function openEdit(item) {
  editing.value = item._id
  form.value = {
    nombre: item.nombre, direccion: item.direccion || '',
    longitud: item.ubicacion?.coordinates?.[0] || -90.55,
    latitud: item.ubicacion?.coordinates?.[1] || 14.63,
    telefono: item.telefono || '', correoContacto: item.correoContacto || '',
    apertura: item.horario?.apertura || '09:00', cierre: item.horario?.cierre || '22:00',
    activo: item.activo,
  }
  showForm.value = true
}

async function load() {
  error.value = ''
  try {
    const params = { skip: skip.value, limit }
    if (filterNombre.value) params.nombre = filterNombre.value
    if (filtroActivo.value) params.activo = filtroActivo.value
    const { data } = await api.get('/restaurantes', { params })
    items.value = data.data || data
    total.value = data.total || 0
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

function onPageChange(newSkip) { skip.value = newSkip; load() }

function confirmSave() {
  confirmAction.value = {
    title: editing.value ? 'Confirmar actualización' : 'Confirmar creación',
    message: editing.value ? '¿Deseas actualizar este restaurante?' : '¿Deseas crear este restaurante?',
    confirmText: editing.value ? 'Actualizar' : 'Crear',
    danger: false, action: save,
  }
}

function confirmDeleteSelected(selected) {
  const n = selected.length
  confirmAction.value = {
    title: n > 1 ? `Eliminar ${n} restaurantes` : 'Eliminar restaurante',
    message: n > 1 ? `¿Estás seguro de eliminar ${n} restaurantes?` : '¿Estás seguro de eliminar este restaurante?',
    confirmText: 'Eliminar', danger: true,
    action: async () => { for (const item of selected) await remove(item._id) },
  }
}

async function executeConfirm() {
  if (confirmAction.value?.action) await confirmAction.value.action()
  confirmAction.value = null
}

async function save() {
  error.value = ''
  const body = {
    nombre: form.value.nombre, direccion: form.value.direccion,
    ubicacion: { type: 'Point', coordinates: [form.value.longitud, form.value.latitud] },
    telefono: form.value.telefono, correoContacto: form.value.correoContacto,
    horario: { apertura: form.value.apertura, cierre: form.value.cierre },
    activo: form.value.activo,
  }
  try {
    if (editing.value) await api.put(`/restaurantes/${editing.value}`, body)
    else await api.post('/restaurantes', body)
    showForm.value = false; load()
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

async function remove(id) {
  try { await api.delete(`/restaurantes/${id}`); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function searchNearby() {
  try {
    const { data } = await api.get('/restaurantes/cercanos', {
      params: { lng: nearbyLng.value, lat: nearbyLat.value, maxDistance: nearbyRadius.value }
    })
    nearbyResults.value = data.data || data
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

onMounted(load)
</script>

<style scoped>
.nearby-results { margin-top: 12px; }
.nearby-item { padding: 8px; border-bottom: 1px solid #eee; }
</style>
