<template>
  <div>
    <div class="page-header">
      <h1>Reseñas</h1>
      <button class="btn btn-primary" @click="openCreate">+ Nueva Reseña</button>
    </div>

    <div class="filters">
      <input v-model="searchText" placeholder="Buscar en comentarios..." @input="searchReviews" />
      <select v-model="filterEstrellas" @change="load">
        <option value="">Todas las estrellas</option>
        <option v-for="n in 5" :key="n" :value="n">{{ n }} estrellas</option>
      </select>
      <select v-model="filterRestaurante" @change="load">
        <option value="">Todos los restaurantes</option>
        <option v-for="r in restaurantesList" :key="r._id" :value="r._id">{{ r.nombre }}</option>
      </select>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="success" class="alert success">{{ success }}</div>

    <DataTable :columns="columns" :items="items" :skip="skip" :limit="limit" :total="total" @page-change="onPageChange">
      <template #toolbar="{ selected, count }">
        <button class="btn btn-sm" :disabled="count !== 1" @click="viewDetail(selected[0]._id)">Detalle</button>
        <button class="btn btn-sm" :disabled="count !== 1" @click="openEdit(selected[0])">Editar</button>
        <button class="btn btn-sm" :disabled="count !== 1" @click="openTags(selected[0])">Tags</button>
        <button class="btn btn-sm btn-danger" :disabled="count === 0" @click="confirmDeleteSelected(selected)">Eliminar{{ count > 0 ? ` (${count})` : '' }}</button>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <ModalForm v-if="showForm" :title="editing ? 'Editar Reseña' : 'Nueva Reseña (Transacción)'" @close="showForm = false">
      <form @submit.prevent="confirmSave">
        <div v-if="!editing" class="form-group">
          <label>Orden (debe estar "entregada")</label>
          <select v-model="form.ordenId" required>
            <option value="" disabled>Seleccionar orden</option>
            <option v-for="o in ordenesEntregadas" :key="o._id" :value="o._id">{{ o.fechaCreacion?.substring(0, 10) }} - Q{{ o.total }} ({{ o.items?.length || 0 }} items)</option>
          </select>
        </div>
        <div v-if="!editing" class="form-group">
          <label>Cliente</label>
          <input v-model="formClienteText" list="review-form-clientes-dl" placeholder="Escribir nombre de cliente..." required />
          <datalist id="review-form-clientes-dl">
            <option v-for="c in clientesList" :key="c._id" :value="`${c.nombre} (${c.email})`" />
          </datalist>
        </div>
        <div v-if="!editing" class="form-group">
          <label>Restaurante</label>
          <select v-model="form.restauranteId" required>
            <option value="" disabled>Seleccionar restaurante</option>
            <option v-for="r in restaurantesList" :key="r._id" :value="r._id">{{ r.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Estrellas</label>
          <div class="stars-input">
            <button v-for="n in 5" :key="n" type="button" class="star-btn" :class="{ active: form.estrellas >= n }" @click="form.estrellas = n">
              &#9733;
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Comentario</label>
          <textarea v-model="form.comentario" rows="4"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" @click="showForm = false">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ editing ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </form>
    </ModalForm>

    <!-- Tags Modal -->
    <ModalForm v-if="showTagsModal" title="Gestionar Tags" @close="showTagsModal = false">
      <div class="tags-list">
        <span v-for="(tag, i) in currentTags" :key="i" class="tag">
          {{ tag }} <button class="tag-remove" @click="removeReviewTag(tag)">x</button>
        </span>
      </div>
      <div class="form-row" style="margin-top: 12px">
        <input v-model="newTag" placeholder="Nuevo tag..." @keyup.enter="addReviewTag" />
        <button class="btn btn-sm btn-primary" @click="addReviewTag">Agregar</button>
      </div>
    </ModalForm>

    <!-- Detail Modal -->
    <ModalForm v-if="showDetail" title="Detalle de Reseña" @close="showDetail = false" width="600px">
      <div v-if="detailData">
        <div class="stars-display">
          <span v-for="n in 5" :key="n" :class="{ 'star-active': detailData.estrellas >= n }">&#9733;</span>
        </div>
        <p><strong>Comentario:</strong> {{ detailData.comentario || 'Sin comentario' }}</p>
        <p v-if="detailData.cliente"><strong>Cliente:</strong> {{ detailData.cliente?.nombre }}</p>
        <p v-if="detailData.restaurante"><strong>Restaurante:</strong> {{ detailData.restaurante?.nombre }}</p>
        <p><strong>Fecha:</strong> {{ detailData.fechaCreacion }}</p>
        <p v-if="detailData.tags?.length"><strong>Tags:</strong> {{ detailData.tags.join(', ') }}</p>
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
const searchText = ref('')
const filterEstrellas = ref('')
const filterRestaurante = ref('')
const clientesList = ref([])
const restaurantesList = ref([])
const ordenesEntregadas = ref([])
const formClienteText = ref('')
const showForm = ref(false)
const editing = ref(null)
const form = ref({})
const confirmAction = ref(null)

const showTagsModal = ref(false)
const currentTagsId = ref(null)
const currentTags = ref([])
const newTag = ref('')
const showDetail = ref(false)
const detailData = ref(null)

const columns = [
  { key: 'estrellas', label: 'Estrellas', render: (i) => '\u2605'.repeat(i.estrellas) + '\u2606'.repeat(5 - i.estrellas) },
  { key: 'comentario', label: 'Comentario', render: (i) => (i.comentario || '').substring(0, 60) + ((i.comentario?.length > 60) ? '...' : '') },
  { key: 'tags', label: 'Tags' },
  { key: 'fechaCreacion', label: 'Fecha', render: (i) => i.fechaCreacion?.substring(0, 10) || '-' },
]

function openCreate() { editing.value = null; form.value = { ordenId: '', clienteId: '', restauranteId: '', estrellas: 5, comentario: '' }; formClienteText.value = ''; showForm.value = true }
function openEdit(item) { editing.value = item._id; form.value = { estrellas: item.estrellas, comentario: item.comentario || '' }; showForm.value = true }

function openTags(item) { currentTagsId.value = item._id; currentTags.value = [...(item.tags || [])]; newTag.value = ''; showTagsModal.value = true }
async function addReviewTag() {
  if (!newTag.value.trim()) return
  try { await api.put(`/reviews/${currentTagsId.value}/tags`, { operation: 'add', tag: newTag.value.trim() }); currentTags.value.push(newTag.value.trim()); newTag.value = ''; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}
async function removeReviewTag(tag) {
  try { await api.put(`/reviews/${currentTagsId.value}/tags`, { operation: 'remove', tag }); currentTags.value = currentTags.value.filter(t => t !== tag); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

let searchTimeout = null
function searchReviews() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (searchText.value.length >= 2) {
      try { const { data } = await api.get('/reviews/buscar', { params: { q: searchText.value } }); items.value = data.data || data }
      catch (e) { error.value = e.response?.data?.error || e.message }
    } else { load() }
  }, 300)
}

async function viewDetail(id) {
  try { const { data } = await api.get(`/reviews/${id}/detalle`); detailData.value = data; showDetail.value = true }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function load() {
  error.value = ''
  try {
    const params = { skip: skip.value, limit }
    if (filterEstrellas.value) params.estrellas = filterEstrellas.value
    if (filterRestaurante.value) params.restauranteId = filterRestaurante.value
    const { data } = await api.get('/reviews', { params })
    items.value = data.data || data
    total.value = data.total || 0
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

function onPageChange(newSkip) { skip.value = newSkip; load() }

function confirmSave() {
  confirmAction.value = { title: editing.value ? 'Confirmar actualización' : 'Confirmar reseña',
    message: editing.value ? '¿Deseas actualizar esta reseña?' : '¿Deseas crear esta reseña? La orden será marcada como reseñada.',
    confirmText: editing.value ? 'Actualizar' : 'Crear', danger: false, action: save }
}
function confirmDeleteSelected(selected) {
  const n = selected.length
  confirmAction.value = { title: n > 1 ? `Eliminar ${n} reseñas` : 'Eliminar reseña',
    message: n > 1 ? `¿Estás seguro de eliminar ${n} reseñas?` : '¿Estás seguro de eliminar esta reseña?',
    confirmText: 'Eliminar', danger: true,
    action: async () => { for (const item of selected) await remove(item._id) } }
}
async function executeConfirm() { if (confirmAction.value?.action) await confirmAction.value.action(); confirmAction.value = null }

async function save() {
  if (!editing.value) {
    const match = clientesList.value.find(c => `${c.nombre} (${c.email})` === formClienteText.value)
    if (!match) { error.value = 'Cliente no encontrado. Seleccione de la lista.'; return }
    form.value.clienteId = match._id
  }
  try {
    if (editing.value) { await api.put(`/reviews/${editing.value}`, form.value) }
    else { await api.post('/reviews', form.value); success.value = 'Reseña creada (orden marcada como reseñada)' }
    showForm.value = false; load()
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

async function remove(id) {
  try { await api.delete(`/reviews/${id}`); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function loadLists() {
  try {
    const [cRes, rRes, oRes] = await Promise.all([
      api.get('/clientes', { params: { limit: 500 } }),
      api.get('/restaurantes', { params: { limit: 500 } }),
      api.get('/ordenes', { params: { estado: 'entregado', limit: 500 } }),
    ])
    clientesList.value = cRes.data.data || cRes.data
    restaurantesList.value = rRes.data.data || rRes.data
    ordenesEntregadas.value = oRes.data.data || oRes.data
  } catch { /* ignore */ }
}

onMounted(() => { load(); loadLists() })
</script>

<style scoped>
.stars-input { display: flex; gap: 4px; }
.star-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #ddd; }
.star-btn.active { color: #f5a623; }
.stars-display { font-size: 1.5rem; color: #ddd; margin-bottom: 12px; }
.star-active { color: #f5a623; }
.tags-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { background: #e94560; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.82rem; display: flex; align-items: center; gap: 4px; }
.tag-remove { background: none; border: none; color: #fff; cursor: pointer; }
</style>
