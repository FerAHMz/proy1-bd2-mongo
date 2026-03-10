<template>
  <div>
    <div class="page-header">
      <h1>Órdenes</h1>
      <div>
        <button class="btn btn-primary" @click="openCreate">+ Nueva Orden</button>
        <button class="btn" @click="openPayWithPoints" style="margin-left: 8px">Pagar con Puntos</button>
      </div>
    </div>

    <div class="filters">
      <select v-model="filterEstado" @change="load">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="preparando">Preparando</option>
        <option value="entregado">Entregado</option>
        <option value="cancelado">Cancelado</option>
      </select>
      <input v-model="filterClienteText" list="ordenes-clientes-dl" placeholder="Buscar cliente..." @input="onFilterClienteChange" />
      <datalist id="ordenes-clientes-dl">
        <option v-for="c in clientesList" :key="c._id" :value="c.nombre" />
      </datalist>
      <select v-model="filterRestaurante" @change="load">
        <option value="">Todos los restaurantes</option>
        <option v-for="r in restaurantesList" :key="r._id" :value="r._id">{{ r.nombre }}</option>
      </select>
      <select v-model="sortField" @change="load">
        <option value="-fechaCreacion">Más reciente</option>
        <option value="fechaCreacion">Más antigua</option>
        <option value="-total">Mayor total</option>
        <option value="total">Menor total</option>
      </select>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="success" class="alert success">{{ success }}</div>

    <DataTable :columns="columns" :items="items" :skip="skip" :limit="limit" :total="total" @page-change="onPageChange">
      <template #toolbar="{ selected, count }">
        <button class="btn btn-sm" :disabled="count !== 1" @click="viewDetail(selected[0]._id)">Detalle</button>
        <button class="btn btn-sm" :disabled="count !== 1" @click="openStatus(selected[0])">Estado</button>
        <button class="btn btn-sm btn-danger" :disabled="count === 0" @click="confirmDeleteSelected(selected)">Eliminar{{ count > 0 ? ` (${count})` : '' }}</button>
      </template>
    </DataTable>

    <!-- Create Order Modal -->
    <ModalForm v-if="showForm" title="Nueva Orden (Transacción)" @close="showForm = false" width="700px">
      <form @submit.prevent="confirmSaveOrder">
        <div class="form-row">
          <div class="form-group">
            <label>Cliente</label>
            <input v-model="formClienteText" list="orden-form-clientes-dl" placeholder="Escribir nombre de cliente..." required />
            <datalist id="orden-form-clientes-dl">
              <option v-for="c in clientesList" :key="c._id" :value="`${c.nombre} (${c.email})`" />
            </datalist>
          </div>
          <div class="form-group">
            <label>Restaurante</label>
            <select v-model="form.restauranteId" required>
              <option value="" disabled>Seleccionar restaurante</option>
              <option v-for="r in restaurantesList" :key="r._id" :value="r._id">{{ r.nombre }}</option>
            </select>
          </div>
        </div>
        <h4>Items</h4>
        <div v-for="(item, i) in form.items" :key="i" class="item-row">
          <div class="form-group" style="flex: 2; min-width: 0">
            <label>Producto</label>
            <select v-model="item.menuId" @change="onMenuSelect(item)" required>
              <option value="" disabled>Seleccionar platillo</option>
              <option v-for="m in menuList" :key="m._id" :value="m._id">{{ m.nombre }}</option>
            </select>
          </div>
          <div class="form-group" style="flex: 1; min-width: 0">
            <label>Tamaño</label>
            <select v-model="item.tamano" @change="onSizeSelect(item)">
              <option v-for="t in getMenuSizes(item.menuId)" :key="t.nombre" :value="t.nombre">{{ t.nombre }}</option>
            </select>
          </div>
          <div class="form-group" style="width: 80px">
            <label>Precio</label>
            <input v-model.number="item.precioUnitario" type="number" step="0.01" />
          </div>
          <div class="form-group" style="width: 80px">
            <label>Costo</label>
            <input v-model.number="item.costoUnitario" type="number" step="0.01" />
          </div>
          <div class="form-group" style="width: 60px">
            <label>Cant</label>
            <input v-model.number="item.cantidad" type="number" min="1" />
          </div>
          <button type="button" class="btn btn-sm btn-danger" style="align-self: flex-end; margin-bottom: 12px" @click="form.items.splice(i, 1)">X</button>
        </div>
        <button type="button" class="btn btn-sm" @click="addItem">+ Item</button>
        <div class="form-row" style="margin-top: 16px">
          <div class="form-group"><label>Propina</label><input v-model.number="form.propina" type="number" step="0.01" /></div>
          <div class="form-group">
            <label>Método de Pago</label>
            <select v-model="form.metodoPago">
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn" @click="showForm = false">Cancelar</button>
          <button type="submit" class="btn btn-primary">Crear Orden</button>
        </div>
      </form>
    </ModalForm>

    <!-- Pay with Points Modal -->
    <ModalForm v-if="showPointsModal" title="Pagar Orden con Puntos (Transacción 4)" @close="showPointsModal = false" width="600px">
      <form @submit.prevent="confirmPayPoints">
        <div class="form-group">
          <label>Seleccionar Orden Pendiente</label>
          <select v-model="pointsForm.ordenId" @change="onSelectOrdenPuntos" required>
            <option value="" disabled>Seleccionar orden...</option>
            <option v-for="o in ordenesPendientes" :key="o._id" :value="o._id">
              ID: {{ o._id.slice(-6) }} | {{ o.clienteNombre }} | Q{{ o.total }} | Requiere {{ o.puntosRequeridos }} puntos
            </option>
          </select>
        </div>
        
        <div v-if="ordenSeleccionada" class="orden-info">
          <h4>Detalles de la Orden</h4>
          <p><strong>Cliente:</strong> {{ ordenSeleccionada.clienteNombre }}</p>
          <p><strong>Puntos disponibles:</strong> {{ ordenSeleccionada.puntosFidelidad }} puntos</p>
          <p><strong>Total en dinero:</strong> Q{{ ordenSeleccionada.total }}</p>
          <p><strong>Puntos requeridos:</strong> {{ ordenSeleccionada.puntosRequeridos }} puntos</p>
          <p><strong>Estado:</strong> {{ ordenSeleccionada.estado }}</p>
          <p><strong>Método de pago actual:</strong> {{ ordenSeleccionada.metodoPago }}</p>
          
          <div v-if="ordenSeleccionada.puntosRequeridos > ordenSeleccionada.puntosFidelidad" class="alert error" style="margin-top: 12px">
            ⚠️ El cliente no tiene suficientes puntos. Necesita {{ ordenSeleccionada.puntosRequeridos }} pero solo tiene {{ ordenSeleccionada.puntosFidelidad }}
          </div>
          <div v-else class="alert success" style="margin-top: 12px">
            ✓ El cliente tiene suficientes puntos para pagar esta orden
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn" @click="showPointsModal = false">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="!ordenSeleccionada || ordenSeleccionada.puntosRequeridos > ordenSeleccionada.puntosFidelidad">
            Pagar con {{ pointsForm.puntosUsados }} Puntos
          </button>
        </div>
      </form>
    </ModalForm>

    <!-- Status Modal -->
    <ModalForm v-if="showStatusModal" title="Cambiar Estado" @close="showStatusModal = false">
      <div class="form-group">
        <label>Nuevo Estado</label>
        <select v-model="newStatus">
          <option value="pendiente">Pendiente</option>
          <option value="preparando">Preparando</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <div class="form-actions">
        <button class="btn" @click="showStatusModal = false">Cancelar</button>
        <button class="btn btn-primary" @click="confirmUpdateStatus">Actualizar</button>
      </div>
    </ModalForm>

    <!-- Detail Modal -->
    <ModalForm v-if="showDetail" title="Detalle de Orden" @close="showDetail = false" width="700px">
      <div v-if="detailData">
        <p><strong>Estado:</strong> {{ detailData.estado }}</p>
        <p><strong>Total:</strong> Q{{ detailData.total }}</p>
        <p><strong>Propina:</strong> Q{{ detailData.propina || 0 }}</p>
        <p><strong>Método Pago:</strong> {{ detailData.metodoPago }}</p>
        <p><strong>Fecha:</strong> {{ detailData.fechaCreacion }}</p>
        <p v-if="detailData.cliente"><strong>Cliente:</strong> {{ detailData.cliente?.nombre }} ({{ detailData.cliente?.email }})</p>
        <p v-if="detailData.restaurante"><strong>Restaurante:</strong> {{ detailData.restaurante?.nombre }}</p>
        <h4>Items</h4>
        <table class="mini-table">
          <thead><tr><th>Producto</th><th>Tamaño</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead>
          <tbody>
            <tr v-for="(it, i) in detailData.items" :key="i">
              <td>{{ it.nombreProducto }}</td><td>{{ it.tamano }}</td><td>{{ it.cantidad }}</td>
              <td>Q{{ it.precioUnitario }}</td><td>Q{{ it.subtotal }}</td>
            </tr>
          </tbody>
        </table>
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
const filterEstado = ref('')
const filterCliente = ref('')
const filterClienteText = ref('')
const filterRestaurante = ref('')
const clientesList = ref([])
const restaurantesList = ref([])
const menuList = ref([])
const formClienteText = ref('')
const sortField = ref('-fechaCreacion')
const confirmAction = ref(null)

const showForm = ref(false)
const form = ref({})
const showPointsModal = ref(false)
const pointsForm = ref({ ordenId: '', puntosUsados: 0 })
const ordenesPendientes = ref([])
const ordenSeleccionada = ref(null)
const showStatusModal = ref(false)
const statusOrderId = ref(null)
const newStatus = ref('preparando')
const showDetail = ref(false)
const detailData = ref(null)

const columns = [
  { key: 'estado', label: 'Estado' },
  { key: 'total', label: 'Total', render: (i) => `Q${i.total}` },
  { key: 'metodoPago', label: 'Pago' },
  { key: 'items', label: 'Items', render: (i) => `${i.items?.length || 0} items` },
  { key: 'fechaCreacion', label: 'Fecha', render: (i) => i.fechaCreacion?.substring(0, 10) || '-' },
]

function getMenuSizes(menuId) {
  const menu = menuList.value.find(m => m._id === menuId)
  return menu?.tamanos || []
}
function onMenuSelect(item) {
  const menu = menuList.value.find(m => m._id === item.menuId)
  if (!menu) return
  item.nombreProducto = menu.nombre
  const sizes = menu.tamanos || []
  if (sizes.length > 0) {
    item.tamano = sizes[0].nombre
    item.precioUnitario = sizes[0].precioVenta || 0
    item.costoUnitario = sizes[0].costoProduccion || 0
  }
}
function onSizeSelect(item) {
  const sizes = getMenuSizes(item.menuId)
  const size = sizes.find(t => t.nombre === item.tamano)
  if (size) {
    item.precioUnitario = size.precioVenta || 0
    item.costoUnitario = size.costoProduccion || 0
  }
}
function addItem() { form.value.items.push({ menuId: '', nombreProducto: '', tamano: 'Mediana', precioUnitario: 0, costoUnitario: 0, cantidad: 1 }) }
function openCreate() {
  form.value = { clienteId: '', restauranteId: '', items: [{ menuId: '', nombreProducto: '', tamano: 'Mediana', precioUnitario: 0, costoUnitario: 0, cantidad: 1 }], propina: 0, metodoPago: 'efectivo' }
  formClienteText.value = ''
  showForm.value = true
}
async function openPayWithPoints() {
  pointsForm.value = { ordenId: '', puntosUsados: 0 }
  ordenSeleccionada.value = null
  // Cargar órdenes pendientes con información del cliente
  try {
    const { data } = await api.get('/ordenes', { params: { estado: 'pendiente' } })
    const ordenes = data.data || data
    // Enriquecer con información del cliente y calcular puntos requeridos
    const ordenesConInfo = await Promise.all(ordenes.map(async (orden) => {
      try {
        const { data: cliente } = await api.get(`/clientes/${orden.clienteId}`)
        // Calcular puntos requeridos basándose en el precioPuntos de cada producto
        let puntosRequeridos = 0
        for (const item of orden.items) {
          const menuItem = menuList.value.find(m => m._id === item.menuId)
          if (menuItem && menuItem.precioPuntos) {
            puntosRequeridos += menuItem.precioPuntos * item.cantidad
          }
        }
        return {
          ...orden,
          clienteNombre: cliente.nombre,
          puntosFidelidad: cliente.puntosFidelidad,
          puntosRequeridos
        }
      } catch {
        return {
          ...orden,
          clienteNombre: 'Desconocido',
          puntosFidelidad: 0,
          puntosRequeridos: 0
        }
      }
    }))
    ordenesPendientes.value = ordenesConInfo
  } catch (e) {
    error.value = e.response?.data?.error || e.message
  }
  showPointsModal.value = true
}
function onSelectOrdenPuntos() {
  const orden = ordenesPendientes.value.find(o => o._id === pointsForm.value.ordenId)
  ordenSeleccionada.value = orden || null
  // Establecer los puntos requeridos
  if (orden) {
    pointsForm.value.puntosUsados = orden.puntosRequeridos || 0
  }
}

let filterClienteTimeout = null
function onFilterClienteChange() {
  clearTimeout(filterClienteTimeout)
  filterClienteTimeout = setTimeout(() => {
    if (!filterClienteText.value) { filterCliente.value = ''; load(); return }
    const match = clientesList.value.find(c => c.nombre.toLowerCase() === filterClienteText.value.toLowerCase().trim())
    filterCliente.value = match ? match._id : ''
    load()
  }, 300)
}

function resolveClienteId(text) {
  const match = clientesList.value.find(c => `${c.nombre} (${c.email})` === text)
  return match ? match._id : null
}
function openStatus(item) { statusOrderId.value = item._id; newStatus.value = item.estado; showStatusModal.value = true }

async function load() {
  error.value = ''; success.value = ''
  try {
    const params = { skip: skip.value, limit, sort: sortField.value }
    if (filterEstado.value) params.estado = filterEstado.value
    if (filterCliente.value) params.clienteId = filterCliente.value
    if (filterRestaurante.value) params.restauranteId = filterRestaurante.value
    const { data } = await api.get('/ordenes', { params })
    items.value = data.data || data
    total.value = data.total || 0
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

function onPageChange(newSkip) { skip.value = newSkip; load() }

function confirmSaveOrder() {
  confirmAction.value = { title: 'Confirmar orden', message: '¿Deseas crear esta orden? Se actualizarán los puntos de fidelidad del cliente.',
    confirmText: 'Crear Orden', danger: false, action: saveOrder }
}
function confirmPayPoints() {
  confirmAction.value = { title: 'Confirmar pago con puntos', message: '¿Deseas pagar esta orden con puntos de fidelidad?',
    confirmText: 'Pagar', danger: false, action: payWithPoints }
}
function confirmUpdateStatus() {
  confirmAction.value = { title: 'Cambiar estado', message: `¿Deseas cambiar el estado a "${newStatus.value}"?`,
    confirmText: 'Cambiar', danger: false, action: updateStatus }
}
function confirmDeleteSelected(selected) {
  const n = selected.length
  confirmAction.value = { title: n > 1 ? `Eliminar ${n} órdenes` : 'Eliminar orden',
    message: n > 1 ? `¿Estás seguro de eliminar ${n} órdenes?` : '¿Estás seguro de eliminar esta orden?',
    confirmText: 'Eliminar', danger: true,
    action: async () => { for (const item of selected) await remove(item._id) } }
}
async function executeConfirm() { if (confirmAction.value?.action) await confirmAction.value.action(); confirmAction.value = null }

async function saveOrder() {
  error.value = ''
  const clienteId = resolveClienteId(formClienteText.value)
  if (!clienteId) { error.value = 'Cliente no encontrado. Seleccione de la lista.'; return }
  const body = { clienteId, restauranteId: form.value.restauranteId,
    items: form.value.items.map(it => ({ ...it, subtotal: it.precioUnitario * it.cantidad })),
    propina: form.value.propina, metodoPago: form.value.metodoPago }
  body.total = body.items.reduce((sum, it) => sum + it.subtotal, 0)
  try { await api.post('/ordenes', body); success.value = 'Orden creada exitosamente (puntos de fidelidad actualizados)'; showForm.value = false; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function payWithPoints() {
  error.value = ''
  
  if (!pointsForm.value.ordenId) {
    error.value = 'Debe seleccionar una orden'
    return
  }
  
  if (!ordenSeleccionada.value) {
    error.value = 'Orden no encontrada'
    return
  }
  
  if (ordenSeleccionada.value.puntosRequeridos > ordenSeleccionada.value.puntosFidelidad) {
    error.value = `El cliente solo tiene ${ordenSeleccionada.value.puntosFidelidad} puntos y necesita ${ordenSeleccionada.value.puntosRequeridos}`
    return
  }
  
  const body = {
    ordenId: pointsForm.value.ordenId
  }
  
  try { 
    const { data } = await api.post('/ordenes/pagar-con-puntos', body)
    success.value = `Orden pagada con ${data.puntosUsados} puntos exitosamente`
    showPointsModal.value = false
    load()
  }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function updateStatus() {
  try { await api.put(`/ordenes/${statusOrderId.value}/estado`, { estado: newStatus.value }); showStatusModal.value = false; load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function viewDetail(id) {
  try { const { data } = await api.get(`/ordenes/${id}/detalle`); detailData.value = data; showDetail.value = true }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function remove(id) {
  try { await api.delete(`/ordenes/${id}`); load() }
  catch (e) { error.value = e.response?.data?.error || e.message }
}

async function loadLists() {
  try {
    const [cRes, rRes, mRes] = await Promise.all([
      api.get('/clientes', { params: { limit: 500 } }),
      api.get('/restaurantes', { params: { limit: 500 } }),
      api.get('/menu', { params: { limit: 500, activo: 'true' } }),
    ])
    clientesList.value = cRes.data.data || cRes.data
    restaurantesList.value = rRes.data.data || rRes.data
    menuList.value = mRes.data.data || mRes.data
  } catch { /* ignore */ }
}

onMounted(() => { load(); loadLists() })
</script>

<style scoped>
.item-row { display: flex; gap: 6px; margin-bottom: 8px; align-items: flex-start; flex-wrap: nowrap; }
.item-row select, .item-row input { width: 100%; }
.mini-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
.mini-table th, .mini-table td { padding: 6px 8px; border: 1px solid #eee; font-size: 0.85rem; }
.mini-table th { background: #f5f5f5; }
.orden-info { 
  background: #f9f9f9; 
  padding: 16px; 
  border-radius: 8px; 
  margin-top: 16px; 
  border-left: 4px solid #e94560;
}
.orden-info h4 { margin-top: 0; margin-bottom: 12px; color: #333; }
.orden-info p { margin: 8px 0; }
</style>
