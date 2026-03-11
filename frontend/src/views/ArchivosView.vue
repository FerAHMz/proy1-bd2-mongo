<template>
  <div>
    <div class="page-header">
      <h1>Gestión de Archivos (GridFS)</h1>
      <button class="btn btn-primary" @click="showUpload = true">+ Subir Archivo</button>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="success" class="alert success">{{ success }}</div>

    <div class="stats-cards">
      <div class="stat-card">
        <h3>Total Archivos</h3>
        <p class="stat-value">{{ total }}</p>
      </div>
      <div class="stat-card">
        <h3>Tamaño Total</h3>
        <p class="stat-value">{{ formatBytes(totalSize) }}</p>
      </div>
    </div>

    <DataTable 
      :columns="columns" 
      :items="items" 
      :skip="0" 
      :limit="100" 
      :total="total"
      @page-change="load"
    >
      <template #toolbar="{ selected, count }">
        <button class="btn btn-sm" :disabled="count !== 1" @click="download(selected[0])">Descargar</button>
        <button class="btn btn-sm btn-danger" :disabled="count === 0" @click="confirmDeleteSelected(selected)">
          Eliminar{{ count > 0 ? ` (${count})` : '' }}
        </button>
      </template>
    </DataTable>

    <ModalForm v-if="showUpload" title="Subir Archivo" @close="showUpload = false" width="500px">
      <form @submit.prevent="confirmUpload">
        <div class="form-group">
          <label>Seleccionar archivo</label>
          <input type="file" ref="fileInput" @change="onFileSelect" required />
        </div>
        <div v-if="selectedFile" class="file-preview">
          <p><strong>Archivo:</strong> {{ selectedFile.name }}</p>
          <p><strong>Tamaño:</strong> {{ formatBytes(selectedFile.size) }}</p>
          <p><strong>Tipo:</strong> {{ selectedFile.type || 'Sin especificar' }}</p>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" @click="showUpload = false">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="!selectedFile || uploading">
            {{ uploading ? 'Subiendo...' : 'Subir' }}
          </button>
        </div>
      </form>
    </ModalForm>

    <ConfirmModal
      v-if="showConfirm"
      :message="confirmMessage"
      @confirm="executeDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api'
import DataTable from '@/components/DataTable.vue'
import ModalForm from '@/components/ModalForm.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const items = ref([])
const total = ref(0)
const error = ref('')
const success = ref('')
const showUpload = ref(false)
const showConfirm = ref(false)
const confirmMessage = ref('')
const selectedFile = ref(null)
const fileInput = ref(null)
const uploading = ref(false)
const toDelete = ref([])

const columns = [
  { key: '_id', label: 'ID', width: '200px' },
  { key: 'filename', label: 'Nombre', width: '300px' },
  { key: 'length', label: 'Tamaño', width: '120px', formatter: (v) => formatBytes(v) },
  { key: 'contentType', label: 'Tipo', width: '180px' },
  { key: 'uploadDate', label: 'Fecha Subida', width: '180px', formatter: (v) => new Date(v).toLocaleString('es-GT') },
]

const totalSize = computed(() => {
  return items.value.reduce((sum, file) => sum + (file.length || 0), 0)
})

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

async function load() {
  try {
    error.value = ''
    const { data } = await api.get('/archivos')
    items.value = data.data || []
    total.value = data.total || 0
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al cargar archivos'
  }
}

function onFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

async function confirmUpload() {
  if (!selectedFile.value) return

  try {
    error.value = ''
    success.value = ''
    uploading.value = true

    const formData = new FormData()
    formData.append('archivo', selectedFile.value)

    const { data } = await api.post('/archivos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    success.value = `Archivo "${selectedFile.value.name}" subido exitosamente`
    showUpload.value = false
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    await load()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al subir archivo'
  } finally {
    uploading.value = false
  }
}

function download(item) {
  window.open(`http://localhost:3000/api/archivos/${item._id}`, '_blank')
}

function confirmDeleteSelected(selected) {
  toDelete.value = selected
  confirmMessage.value = `¿Eliminar ${selected.length} archivo(s)?`
  showConfirm.value = true
}

async function executeDelete() {
  try {
    error.value = ''
    success.value = ''
    
    for (const item of toDelete.value) {
      await api.delete(`/archivos/${item._id}`)
    }
    
    success.value = `${toDelete.value.length} archivo(s) eliminado(s) exitosamente`
    showConfirm.value = false
    toDelete.value = []
    await load()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al eliminar archivos'
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: #1a1a2e;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.stat-card h3 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #e94560;
}

.alert {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.alert.error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert.success {
  background: #efe;
  color: #3c3;
  border: 1px solid #cfc;
}

.file-preview {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
}

.file-preview p {
  margin: 6px 0;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="file"] {
  width: 100%;
  padding: 8px;
  border: 2px dashed #ddd;
  border-radius: 6px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #e94560;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #d63850;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
