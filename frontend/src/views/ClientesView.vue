<template>
  <div>
    <div class="page-header">
      <h1>Clientes</h1>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo Cliente</button>
    </div>

    <div class="filters">
      <input v-model="filterNombre" placeholder="Buscar por nombre..." @input="load" />
      <select v-model="filterZona" @change="load">
        <option value="">Todas las zonas</option>
        <option v-for="z in zonas" :key="z" :value="z">{{ z }}</option>
      </select>
      <input v-model="filterTag" placeholder="Filtrar por tag..." @input="load" />
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>

    <DataTable :columns="columns" :items="items" :skip="skip" :limit="limit" :total="total" @page-change="onPageChange">
      <template #toolbar="{ selected, count }">
        <button class="btn btn-sm" :disabled="count !== 1" @click="openEdit(selected[0])">Editar</button>
        <button class="btn btn-sm" :disabled="count !== 1" @click="openTags(selected[0])">Tags</button>
        <button class="btn btn-sm" :disabled="count !== 1" @click="viewOrders(selected[0])">Órdenes</button>
        <button class="btn btn-sm btn-danger" :disabled="count === 0" @click="confirmDeleteSelected(selected)">Eliminar{{ count > 0 ? ` (${count})` : '' }}</button>
      </template>
    </DataTable>

    <ModalForm v-if="showForm" :title="editing ? 'Editar Cliente' : 'Nuevo Cliente'" @close="showForm = false" width="600px">
      <form @submit.prevent="confirmSave">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required />
        </div>
        <div class="form-group">
          <label>Teléfono</label>
          <input v-model="form.telefono" />
        </div>
        <h4>Dirección</h4>
        <div class="form-row">
          <div class="form-group"><label>Calle</label><input v-model="form.calle" /></div>
          <div class="form-group"><label>Número</label><input v-model="form.numero" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Zona</label><input v-model="form.zona" /></div>
          <div class="form-group"><label>Ciudad</label><input v-model="form.ciudad" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Departamento</label><input v-model="form.departamento" /></div>
          <div class="form-group"><label>Código Postal</label><input v-model="form.codigoPostal" /></div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" @click="showForm = false">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ editing ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </form>
    </ModalForm>

    <ModalForm v-if="showTagsModal" title="Gestionar Tags" @close="showTagsModal = false">
      <div class="tags-list">
        <span v-for="(tag, i) in currentTags" :key="i" class="tag">
          {{ tag }} <button class="tag-remove" @click="removeTag(tag)">x</button>
        </span>
      </div>
      <div class="form-row" style="margin-top: 12px">
        <input v-model="newTag" placeholder="Nuevo tag..." @keyup.enter="addTag" />
        <button class="btn btn-sm btn-primary" @click="addTag">Agregar</button>
      </div>
    </ModalForm>

    <ModalForm v-if="showAddressModal" title="Actualizar Dirección" @close="showAddressModal = false">
      <form @submit.prevent="confirmSaveAddress">
        <div class="form-group"><label>Calle</label><input v-model="addressForm.calle" /></div>
        <div class="form-group"><label>Número</label><input v-model="addressForm.numero" /></div>
        <div class="form-group"><label>Zona</label><input v-model="addressForm.zona" /></div>
        <div class="form-group"><label>Ciudad</label><input v-model="addressForm.ciudad" /></div>
        <div class="form-group"><label>Departamento</label><input v-model="addressForm.departamento" /></div>
        <div class="form-group"><label>Código Postal</label><input v-model="addressForm.codigoPostal" /></div>
        <div class="form-actions">
          <button type="button" class="btn" @click="showAddressModal = false">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </form>
    </ModalForm>

    <ModalForm v-if="showOrdersModal" title="Historial de Órdenes" @close="showOrdersModal = false" width="700px">
      <div v-if="clientOrders.length === 0" class="empty">Sin órdenes</div>
      <div v-for="o in clientOrders" :key="o._id" class="order-item">
        <strong>{{ o.estado }}</strong> - Q{{ o.total }} - {{ o.fechaCreacion?.substring(0, 10) }}
        <span class="muted"> | {{ o.items?.length || 0 }} items</span>
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
const filterNombre = ref('')
const filterZona = ref('')
const filterTag = ref('')
const zonas = ref([])
const showForm = ref(false)
const editing = ref(null)
const form = ref({})
const confirmAction = ref(null)
const showTagsModal = ref(false)
const currentTagsId = ref(null)
const currentTags = ref([])
const newTag = ref('')
const showAddressModal = ref(false)
const addressClientId = ref(null)
const addressForm = ref({})
const showOrdersModal = ref(false)
const clientOrders = ref([])

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'puntosFidelidad', label: 'Puntos' },
  { key: 'tags', label: 'Tags' },
  { key: 'activo', label: 'Activo' },
]

function resetForm() { form.value = { nombre: '', email: '', telefono: '', calle: '', numero: '', zona: '', ciudad: '', departamento: '', codigoPostal: '' } }
function openCreate() { editing.value = null; resetForm(); showForm.value = true }
function openEdit(item) {
  editing.value = item._id
  form.value = { nombre: item.nombre, email: item.email, telefono: item.telefono || '',
    calle: item.direccion?.calle || '', numero: item.direccion?.numero || '',
    zona: item.direccion?.zona || '', ciudad: item.direccion?.ciudad || '',
    departamento: item.direccion?.departamento || '', codigoPostal: item.direccion?.codigoPostal || '' }
  showForm.value = true
}

function openTags(item) { currentTagsId.value = item._id; currentTags.value = [...(item.tags || [])]; newTag.value = ''; showTagsModal.value = true }
async function addTag() {
  if (!newTag.value.trim()) return
  try { await api.put(`/clientes/${currentTagsId.value}/tags`, { operation: 'add', tag: newTag.value.trim() }); currentTags.value.push(newTag.value.trim()); newTag.value = ''; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}
async function removeTag(tag) {
  try { await api.put(`/clientes/${currentTagsId.value}/tags`, { operation: 'remove', tag }); currentTags.value = currentTags.value.filter(t => t !== tag); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

function openAddress(item) { addressClientId.value = item._id; addressForm.value = { ...(item.direccion || {}) }; showAddressModal.value = true }
function confirmSaveAddress() {
  confirmAction.value = { title: 'Actualizar dirección', message: '¿Deseas actualizar la dirección?', confirmText: 'Guardar', danger: false, action: saveAddress }
}
async function saveAddress() {
  try { await api.put(`/clientes/${addressClientId.value}/direccion`, addressForm.value); showAddressModal.value = false; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function viewOrders(item) {
  try { const { data } = await api.get(`/clientes/${item._id}/ordenes`); clientOrders.value = data.data || data; showOrdersModal.value = true }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function load() {
  error.value = ''
  try {
    const params = { skip: skip.value, limit }
    if (filterNombre.value) params.nombre = filterNombre.value
    if (filterZona.value) params.zona = filterZona.value
    if (filterTag.value) params.tag = filterTag.value
    const { data } = await api.get('/clientes', { params })
    items.value = data.data || data
    total.value = data.total || 0
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

function onPageChange(newSkip) { skip.value = newSkip; load() }

async function loadZonas() {
  try { const { data } = await api.get('/reportes/distinct/clientes/direccion.zona'); zonas.value = (data.values || data).filter(Boolean) }
  catch { /* ignore */ }
}

function confirmSave() {
  confirmAction.value = { title: editing.value ? 'Confirmar actualización' : 'Confirmar creación',
    message: editing.value ? '¿Deseas actualizar este cliente?' : '¿Deseas crear este cliente?',
    confirmText: editing.value ? 'Actualizar' : 'Crear', danger: false, action: save }
}
function confirmDeleteSelected(selected) {
  const n = selected.length
  confirmAction.value = { title: n > 1 ? `Eliminar ${n} clientes` : 'Eliminar cliente',
    message: n > 1 ? `¿Estás seguro de eliminar ${n} clientes?` : '¿Estás seguro de eliminar este cliente?',
    confirmText: 'Eliminar', danger: true,
    action: async () => { for (const item of selected) await remove(item._id) } }
}
async function executeConfirm() { if (confirmAction.value?.action) await confirmAction.value.action(); confirmAction.value = null }

async function save() {
  const body = { nombre: form.value.nombre, email: form.value.email, telefono: form.value.telefono,
    direccion: { calle: form.value.calle, numero: form.value.numero, zona: form.value.zona, ciudad: form.value.ciudad, departamento: form.value.departamento, codigoPostal: form.value.codigoPostal } }
  try { if (editing.value) await api.put(`/clientes/${editing.value}`, body); else await api.post('/clientes', body); showForm.value = false; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function remove(id) {
  try { await api.delete(`/clientes/${id}`); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

onMounted(() => { load(); loadZonas() })
</script>

<style scoped>
.tags-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { background: #e94560; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.82rem; display: flex; align-items: center; gap: 4px; }
.tag-remove { background: none; border: none; color: #fff; cursor: pointer; font-size: 0.9rem; }
.order-item { padding: 8px; border-bottom: 1px solid #eee; }
.muted { color: #999; font-size: 0.85rem; }
</style>
