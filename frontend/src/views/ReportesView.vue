<template>
  <div>
    <h1>Reportes y Analítica</h1>

    <div class="report-grid">
      <div class="report-card">
        <h3>Platillo Más Vendido</h3>
        <button class="btn btn-primary" @click="loadReport('platillo-mas-vendido', 'topPlatillo')">Generar</button>
        <div v-if="topPlatillo" class="report-result">
          <div v-for="(p, i) in topPlatillo" :key="i" class="report-item">
            <strong>#{{ i + 1 }} {{ p._id || p.nombre }}</strong> - {{ p.totalVendido || p.total }} unidades
          </div>
        </div>
      </div>

      <div class="report-card">
        <h3>Restaurante Mejor Calificado</h3>
        <button class="btn btn-primary" @click="loadReport('restaurante-mejor-calificado', 'topRestaurante')">Generar</button>
        <div v-if="topRestaurante" class="report-result">
          <div v-for="(r, i) in topRestaurante" :key="i" class="report-item">
            <strong>#{{ i + 1 }} {{ r.nombre || r._id }}</strong> - {{ r.promedioEstrellas?.toFixed(1) || r.promedio?.toFixed(1) }} estrellas ({{ r.totalResenas || r.total }} reseñas)
          </div>
        </div>
      </div>

      <div class="report-card">
        <h3>Margen por Sede</h3>
        <button class="btn btn-primary" @click="loadReport('margen-por-sede', 'margenSede')">Generar</button>
        <div v-if="margenSede" class="report-result">
          <div v-for="(m, i) in margenSede" :key="i" class="report-item">
            <strong>{{ m.nombre || m._id }}</strong> - Ingresos: Q{{ m.totalVentas?.toFixed(2) || 0 }} | Costos: Q{{ m.totalCostos?.toFixed(2) || 0 }} | Margen: Q{{ m.margen?.toFixed(2) || 0 }} ({{ m.margenPorcentaje?.toFixed(1) || 0 }}%)
          </div>
        </div>
      </div>

      <div class="report-card">
        <h3>Cliente Más Frecuente</h3>
        <button class="btn btn-primary" @click="loadReport('cliente-mas-frecuente', 'topCliente')">Generar</button>
        <div v-if="topCliente" class="report-result">
          <div v-for="(c, i) in topCliente" :key="i" class="report-item">
            <strong>#{{ i + 1 }} {{ c.nombre || c._id }}</strong> - {{ c.totalOrdenes || c.total }} órdenes
          </div>
        </div>
      </div>

      <div class="report-card">
        <h3>Ventas por Mes</h3>
        <button class="btn btn-primary" @click="loadReport('ventas-por-mes', 'ventasMes')">Generar</button>
        <div v-if="ventasMes" class="report-result">
          <div v-for="(v, i) in ventasMes" :key="i" class="report-item">
            <strong>{{ v._id?.anio || v._id }}/{{ v._id?.mes || '' }}</strong> - Q{{ v.totalVentas?.toFixed(2) || 0 }} ({{ v.totalOrdenes || 0 }} órdenes)
          </div>
        </div>
      </div>

      <div class="report-card">
        <h3>Órdenes por Restaurante</h3>
        <button class="btn btn-primary" @click="loadReport('ordenes-por-restaurante', 'ordenesRest')">Generar</button>
        <div v-if="ordenesRest" class="report-result">
          <div v-for="(o, i) in ordenesRest" :key="i" class="report-item">
            <strong>{{ o.nombre || o._id }}</strong> - {{ o.totalOrdenes || o.total }} órdenes
          </div>
        </div>
      </div>
    </div>

    <div class="distinct-section">
      <h2>Consultas Simples</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Colección</label>
          <select v-model="distinctCol">
            <option value="menu">Menu</option>
            <option value="clientes">Clientes</option>
            <option value="ordenes">Ordenes</option>
            <option value="reviews">Reviews</option>
          </select>
        </div>
        <div class="form-group">
          <label>Campo</label>
          <input v-model="distinctField" placeholder="ej: tags, estado..." />
        </div>
        <button class="btn btn-primary" @click="loadDistinct" style="align-self: flex-end">Distinct</button>
      </div>
      <div v-if="distinctResult" class="report-result">
        <strong>Valores distintos ({{ distinctResult.length }}):</strong>
        <div class="distinct-values">{{ distinctResult.join(', ') }}</div>
      </div>
    </div>

    <div v-if="error" class="alert error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const error = ref('')
const topPlatillo = ref(null)
const topRestaurante = ref(null)
const margenSede = ref(null)
const topCliente = ref(null)
const ventasMes = ref(null)
const ordenesRest = ref(null)

const distinctCol = ref('menu')
const distinctField = ref('tags')
const distinctResult = ref(null)

const reports = { topPlatillo, topRestaurante, margenSede, topCliente, ventasMes, ordenesRest }

async function loadReport(endpoint, key) {
  error.value = ''
  try {
    const { data } = await api.get(`/reportes/${endpoint}`)
    const arr = data.data || data
    reports[key].value = Array.isArray(arr) ? arr : [arr]
  } catch (e) { error.value = e.response?.data?.error || e.message }
}

async function loadDistinct() {
  error.value = ''
  try {
    const { data } = await api.get(`/reportes/distinct/${distinctCol.value}/${distinctField.value}`)
    distinctResult.value = data.values || data
  } catch (e) { error.value = e.response?.data?.error || e.message }
}
</script>

<style scoped>
.report-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; margin-bottom: 32px; }
.report-card { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.report-card h3 { margin: 0 0 12px; font-size: 1rem; }
.report-result { margin-top: 12px; }
.report-item { padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 0.88rem; }
.distinct-section { background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.distinct-values { margin-top: 8px; color: #333; font-size: 0.88rem; }
</style>
