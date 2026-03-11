<template>
  <div>
    <div class="page-header">
      <h1>Menú</h1>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo Platillo</button>
    </div>

    <div class="filters">
      <input v-model="searchTerm" placeholder="Buscar por nombre..." @input="searchMenu" />
      <input v-model="filterTag" placeholder="Filtrar por tag..." @input="load" />
      <select v-model="filtroActivo" @change="load">
        <option value="">Todos</option>
        <option value="true">Solo activos</option>
        <option value="false">Solo inactivos</option>
      </select>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="success" class="alert success">{{ success }}</div>

    <DataTable :columns="columns" :items="items" :skip="skip" :limit="limit" :total="total" @page-change="onPageChange">
      <template #toolbar="{ selected, count }">
        <button class="btn btn-sm" :disabled="count !== 1" @click="openEdit(selected[0])">Editar</button>
        <button class="btn btn-sm" :disabled="count !== 1" @click="openTags(selected[0])">Tags</button>
        <button class="btn btn-sm btn-bulk" :disabled="count < 2" @click="openBulkStatus(selected)">Cambiar estado{{ count > 1 ? ` (${count})` : '' }}</button>
        <button class="btn btn-sm btn-danger" :disabled="count === 0" @click="confirmDeleteSelected(selected)">Eliminar{{ count > 0 ? ` (${count})` : '' }}</button>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <ModalForm v-if="showForm" :title="editing ? 'Editar Platillo' : 'Nuevo Platillo'" @close="showForm = false" width="650px">
      <form @submit.prevent="confirmSave">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" required />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="form.descripcion" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Precio en Puntos</label>
          <input v-model.number="form.precioPuntos" type="number" />
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="menu-activo" v-model="form.activo" />
          <label for="menu-activo">Activo</label>
        </div>

        <h4>Tamaños</h4>
        <div v-for="(t, i) in form.tamanos" :key="i" class="size-edit-row">
          <div class="form-group size-field">
            <label>Nombre</label>
            <input v-model="t.nombre" placeholder="ej. Mediana" />
          </div>
          <div class="form-group size-field">
            <label>Venta (Q)</label>
            <input v-model.number="t.precioVenta" type="number" step="0.01" @input="calcMargen(t)" />
          </div>
          <div class="form-group size-field">
            <label>Costo (Q)</label>
            <input v-model.number="t.costoProduccion" type="number" step="0.01" @input="calcMargen(t)" />
          </div>
          <div class="form-group size-field">
            <label>Margen (%)</label>
            <input :value="t.margenEstimado" type="number" step="0.01" readonly class="input-readonly" />
          </div>
          <button type="button" class="btn btn-sm btn-danger" style="align-self: flex-end; margin-bottom: 12px" @click="form.tamanos.splice(i, 1)">X</button>
        </div>
        <button type="button" class="btn btn-sm" @click="form.tamanos.push({ nombre: '', precioVenta: 0, costoProduccion: 0, margenEstimado: 0 })">+ Agregar tamaño</button>

        <div class="form-actions">
          <button type="button" class="btn" @click="showForm = false">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ editing ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </form>
    </ModalForm>

    <!-- Sizes Modal -->
    <ModalForm v-if="showSizesModal" title="Gestionar Tamaños" @close="showSizesModal = false" width="600px">
      <div v-for="(t, i) in currentSizes" :key="i" class="size-display">
        <strong>{{ t.nombre }}</strong>: Q{{ t.precioVenta }} (costo: Q{{ t.costoProduccion }})
        <button class="btn btn-sm btn-danger" @click="removeSize(t.nombre)">Quitar</button>
      </div>
      <h4>Agregar Tamaño</h4>
      <div class="form-row">
        <div class="form-group"><label>Nombre</label><input v-model="newSize.nombre" /></div>
        <div class="form-group"><label>Precio Venta (Q)</label><input v-model.number="newSize.precioVenta" type="number" step="0.01" /></div>
        <div class="form-group"><label>Costo (Q)</label><input v-model.number="newSize.costoProduccion" type="number" step="0.01" /></div>
        <button class="btn btn-sm btn-primary" style="align-self: flex-end; margin-bottom: 12px" @click="addSize">Agregar</button>
      </div>
    </ModalForm>

    <!-- Tags Modal -->
    <ModalForm v-if="showTagsModal" title="Gestionar Tags" @close="showTagsModal = false">
      <div class="tags-list">
        <span v-for="(tag, i) in currentTags" :key="i" class="tag">
          {{ tag }} <button class="tag-remove" @click="removeMenuTag(tag)">x</button>
        </span>
      </div>
      <div class="form-row" style="margin-top: 12px">
        <input v-model="newTag" placeholder="Nuevo tag..." @keyup.enter="addMenuTag" />
        <button class="btn btn-sm btn-primary" @click="addMenuTag">Agregar</button>
      </div>
    </ModalForm>

    <!-- BulkWrite: estado individual por platillo -->
    <ModalForm v-if="showBulkModal" title="Editar estado por platillo (BulkWrite)" @close="showBulkModal = false" width="500px">
      <p style="margin-bottom: 12px">Asigna el estado de cada platillo individualmente. Se enviarán en una sola operación BulkWrite.</p>
      <div v-for="item in bulkItems" :key="item._id" class="bulk-row">
        <span class="bulk-nombre">{{ item.nombre }}</span>
        <select v-model="item.activo" class="bulk-select">
          <option :value="true">Activo</option>
          <option :value="false">Inactivo</option>
        </select>
      </div>
      <div class="form-actions" style="margin-top: 16px">
        <button class="btn" @click="showBulkModal = false">Cancelar</button>
        <button class="btn btn-primary" @click="executeBulkStatus">Aplicar ({{ bulkItems.length }} operaciones)</button>
      </div>
    </ModalForm>

    <ConfirmModal v-if="confirmAction" :title="confirmAction.title" :message="confirmAction.message"
      :confirmText="confirmAction.confirmText" :danger="confirmAction.danger"
      @confirm="executeConfirm" @cancel="confirmAction = null" />
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
const success = ref('')
const searchTerm = ref('')
const filterTag = ref('')
const filtroActivo = ref('')
const showForm = ref(false)
const editing = ref(null)
const form = ref({})
const confirmAction = ref(null)

const showSizesModal = ref(false)
const currentSizesId = ref(null)
const currentSizes = ref([])
const newSize = ref({ nombre: '', precioVenta: 0, costoProduccion: 0 })

const showTagsModal = ref(false)
const currentTagsId = ref(null)
const currentTags = ref([])
const newTag = ref('')

const showBulkModal = ref(false)
const bulkItems = ref([])

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'tags', label: 'Tags' },
  { key: 'precioPuntos', label: 'Precio Puntos' },
  { key: 'activo', label: 'Activo' },
  { key: 'tamanos', label: 'Tamaños', render: (i) => i.tamanos?.map(t => `${t.nombre}: Q${t.precioVenta}`).join(', ') || '-' },
]

function calcMargen(t) {
  if (t.precioVenta > 0) t.margenEstimado = Math.round(((t.precioVenta - t.costoProduccion) / t.precioVenta) * 10000) / 100
  else t.margenEstimado = 0
}

function resetForm() {
  form.value = { nombre: '', descripcion: '', precioPuntos: 0, activo: true, tamanos: [{ nombre: 'Mediana', precioVenta: 0, costoProduccion: 0, margenEstimado: 0 }] }
}
function openCreate() { editing.value = null; resetForm(); showForm.value = true }
function openEdit(item) {
  editing.value = item._id
  form.value = { nombre: item.nombre, descripcion: item.descripcion || '', precioPuntos: item.precioPuntos || 0,
    activo: item.activo, tamanos: item.tamanos ? item.tamanos.map(t => ({ ...t })) : [] }
  showForm.value = true
}

function openSizes(item) { currentSizesId.value = item._id; currentSizes.value = [...(item.tamanos || [])]; newSize.value = { nombre: '', precioVenta: 0, costoProduccion: 0 }; showSizesModal.value = true }
async function addSize() {
  if (!newSize.value.nombre) return
  try { await api.put(`/menu/${currentSizesId.value}/tamanos`, { operation: 'add', tamano: { ...newSize.value } }); currentSizes.value.push({ ...newSize.value }); newSize.value = { nombre: '', precioVenta: 0, costoProduccion: 0 }; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}
async function removeSize(nombre) {
  try { await api.put(`/menu/${currentSizesId.value}/tamanos`, { operation: 'remove', nombre }); currentSizes.value = currentSizes.value.filter(s => s.nombre !== nombre); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

function openTags(item) { currentTagsId.value = item._id; currentTags.value = [...(item.tags || [])]; newTag.value = ''; showTagsModal.value = true }
async function addMenuTag() {
  if (!newTag.value.trim()) return
  try { await api.put(`/menu/${currentTagsId.value}/tags`, { operation: 'add', tag: newTag.value.trim() }); currentTags.value.push(newTag.value.trim()); newTag.value = ''; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}
async function removeMenuTag(tag) {
  try { await api.put(`/menu/${currentTagsId.value}/tags`, { operation: 'remove', tag }); currentTags.value = currentTags.value.filter(t => t !== tag); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

let searchTimeout = null
function searchMenu() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => load(), 300)
}

async function load() {
  error.value = ''
  try {
    const params = { skip: skip.value, limit }
    if (filtroActivo.value) params.activo = filtroActivo.value
    if (filterTag.value) params.tag = filterTag.value
    if (searchTerm.value.length >= 2) params.nombre = searchTerm.value
    const { data } = await api.get('/menu', { params })
    items.value = data.data || data
    total.value = data.total || 0
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

function onPageChange(newSkip) { skip.value = newSkip; load() }

function confirmSave() {
  confirmAction.value = { title: editing.value ? 'Confirmar actualización' : 'Confirmar creación',
    message: editing.value ? '¿Deseas actualizar este platillo?' : '¿Deseas crear este platillo?',
    confirmText: editing.value ? 'Actualizar' : 'Crear', danger: false, action: save }
}
function confirmDeleteSelected(selected) {
  const n = selected.length
  confirmAction.value = { title: n > 1 ? `Eliminar ${n} platillos` : 'Eliminar platillo',
    message: n > 1 ? `¿Estás seguro de eliminar ${n} platillos?` : '¿Estás seguro de eliminar este platillo?',
    confirmText: 'Eliminar', danger: true,
    action: async () => { for (const item of selected) await remove(item._id) } }
}
async function executeConfirm() { if (confirmAction.value?.action) await confirmAction.value.action(); confirmAction.value = null }

async function save() {
  try { if (editing.value) await api.put(`/menu/${editing.value}`, form.value); else await api.post('/menu', form.value); showForm.value = false; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}
async function remove(id) {
  try { await api.delete(`/menu/${id}`); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

function openBulkStatus(selected) {
  bulkItems.value = selected.map(item => ({ _id: item._id, nombre: item.nombre, activo: item.activo }))
  showBulkModal.value = true
}

async function executeBulkStatus() {
  error.value = ''
  success.value = ''
  const operations = bulkItems.value.map(item => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: { activo: item.activo } }
    }
  }))
  try {
    const { data } = await api.post('/bulk/menu', { operations })
    showBulkModal.value = false
    success.value = `BulkWrite: ${data.modifiedCount} platillo(s) actualizados`
    setTimeout(() => { success.value = '' }, 4000)
    load()
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

onMounted(load)
</script>

<style scoped>
.size-edit-row { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 4px; flex-wrap: nowrap; }
.size-field { flex: 1; min-width: 0; }
.size-field input { width: 100%; }
.input-readonly { background: #f0f0f0; color: #666; }
.btn-bulk { background: #2196f3; color: #fff; border: none; }
.btn-bulk:hover:not(:disabled) { background: #1976d2; }
.bulk-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
.bulk-nombre { flex: 1; font-size: 0.95rem; }
.bulk-select { width: 120px; }
.alert.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; padding: 10px 14px; border-radius: 6px; margin-bottom: 12px; }
.size-display { padding: 8px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.tags-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { background: #e94560; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.82rem; display: flex; align-items: center; gap: 4px; }
.tag-remove { background: none; border: none; color: #fff; cursor: pointer; }
</style>
