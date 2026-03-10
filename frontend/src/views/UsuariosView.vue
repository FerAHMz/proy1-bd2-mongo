<template>
  <div>
    <div class="page-header">
      <h1>Usuarios</h1>
      <button class="btn btn-primary" @click="openCreate">+ Nuevo Usuario</button>
    </div>

    <div class="filters">
      <select v-model="filterRol" @change="load">
        <option value="">Todos los roles</option>
        <option value="admin">Admin</option>
        <option value="gerente">Gerente</option>
        <option value="operador">Operador</option>
      </select>
      <select v-model="filtroActivo" @change="load">
        <option value="">Todos</option>
        <option value="true">Solo activos</option>
        <option value="false">Solo inactivos</option>
      </select>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>

    <DataTable :columns="columns" :items="items" :skip="skip" :limit="limit" :total="total" @page-change="onPageChange">
      <template #toolbar="{ selected, count }">
        <button class="btn btn-sm" :disabled="count !== 1" @click="openEdit(selected[0])">Editar</button>
        <button class="btn btn-sm btn-danger" :disabled="count === 0" @click="confirmDeleteSelected(selected)">Eliminar{{ count > 0 ? ` (${count})` : '' }}</button>
      </template>
    </DataTable>

    <ModalForm v-if="showForm" :title="editing ? 'Editar Usuario' : 'Nuevo Usuario'" @close="showForm = false">
      <form @submit.prevent="confirmSave">
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required />
        </div>
        <div class="form-group" v-if="!editing">
          <label>Password</label>
          <input v-model="form.passwordHash" type="password" required />
        </div>
        <div class="form-group">
          <label>Rol</label>
          <select v-model="form.rol" required>
            <option value="admin">Admin</option>
            <option value="gerente">Gerente</option>
            <option value="operador">Operador</option>
          </select>
        </div>
        <div class="checkbox-group">
          <input type="checkbox" id="activo-check" v-model="form.activo" />
          <label for="activo-check">Activo</label>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" @click="showForm = false">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ editing ? 'Actualizar' : 'Crear' }}</button>
        </div>
      </form>
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
const filterRol = ref('')
const filtroActivo = ref('')
const showForm = ref(false)
const editing = ref(null)
const form = ref({})
const confirmAction = ref(null)

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'rol', label: 'Rol' },
  { key: 'activo', label: 'Activo' },
  { key: 'fechaCreacion', label: 'Creado', render: (i) => i.fechaCreacion?.substring(0, 10) || '-' },
]

function resetForm() {
  form.value = { nombre: '', email: '', passwordHash: '', rol: 'operador', activo: true }
}

function openCreate() { editing.value = null; resetForm(); showForm.value = true }
function openEdit(item) {
  editing.value = item._id
  form.value = { nombre: item.nombre, email: item.email, rol: item.rol, activo: item.activo }
  showForm.value = true
}

async function load() {
  error.value = ''
  try {
    const params = { skip: skip.value, limit }
    if (filterRol.value) params.rol = filterRol.value
    if (filtroActivo.value) params.activo = filtroActivo.value
    const { data } = await api.get('/usuarios', { params })
    items.value = data.data || data
    total.value = data.total || 0
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

function onPageChange(newSkip) { skip.value = newSkip; load() }

function confirmSave() {
  confirmAction.value = {
    title: editing.value ? 'Confirmar actualización' : 'Confirmar creación',
    message: editing.value ? '¿Deseas actualizar este usuario?' : '¿Deseas crear este usuario?',
    confirmText: editing.value ? 'Actualizar' : 'Crear',
    danger: false,
    action: save,
  }
}

function confirmDeleteSelected(selected) {
  const n = selected.length
  confirmAction.value = {
    title: n > 1 ? `Eliminar ${n} usuarios` : 'Eliminar usuario',
    message: n > 1 ? `¿Estás seguro de eliminar ${n} usuarios?` : '¿Estás seguro de eliminar este usuario?',
    confirmText: 'Eliminar', danger: true,
    action: async () => { for (const item of selected) await remove(item._id) },
  }
}

async function executeConfirm() {
  if (confirmAction.value?.action) await confirmAction.value.action()
  confirmAction.value = null
}

async function save() {
  try {
    if (editing.value) await api.put(`/usuarios/${editing.value}`, form.value)
    else await api.post('/usuarios', form.value)
    showForm.value = false; load()
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

async function remove(id) {
  try { await api.delete(`/usuarios/${id}`); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

onMounted(load)
</script>
