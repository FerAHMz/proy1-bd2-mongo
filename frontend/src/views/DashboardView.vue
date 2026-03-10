<template>
  <div>
    <h1>Dashboard - Castor's Pizza</h1>
    <p class="subtitle">Sistema de Gestión de Pedidos y Reseñas</p>

    <!-- Estadísticas rápidas -->
    <div class="stats-grid" v-if="stats">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- Mongo Charts Dashboard -->
    <div class="charts-section">
      <h2>Análisis Detallado</h2>
      <div class="chart-container">
        <iframe
          :src="chartsDashboardUrl"
          frameborder="0"
          height="600"
          width="100%"
        ></iframe>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const stats = ref([])

// URL del dashboard de Mongo Charts
const chartsDashboardUrl = ref('https://charts.mongodb.com/charts-project-0-lglvswl/embed/dashboards?id=d73eb7a2-0c07-4d1f-81d0-1123bbffafe6&theme=light&autoRefresh=true&maxDataAge=14400&showTitleAndDesc=true&scalingWidth=fixed&scalingHeight=fixed')

onMounted(async () => {
  const collections = ['clientes', 'restaurante', 'ordenes', 'reviews', 'menu', 'usuarios']
  const labels = ['Clientes', 'Restaurantes', 'Órdenes', 'Reseñas', 'Items Menú', 'Usuarios']
  const results = []
  for (let i = 0; i < collections.length; i++) {
    try {
      const { data } = await api.get(`/reportes/conteo/${collections[i]}`)
      results.push({ label: labels[i], value: data.count ?? data.total ?? 0 })
    } catch {
      results.push({ label: labels[i], value: '?' })
    }
  }
  stats.value = results
})
</script>

<style scoped>
.subtitle { color: #666; margin-bottom: 24px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; margin-bottom: 32px; }
.stat-card { background: #fff; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.stat-value { font-size: 2rem; font-weight: 700; color: #e94560; }
.stat-label { color: #666; margin-top: 4px; font-size: 0.9rem; }

/* Sección de Charts */
.charts-section { margin-top: 40px; }
.charts-section h2 { margin-bottom: 16px; color: #333; }
.chart-container { 
  background: #fff; 
  border-radius: 8px; 
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}
.chart-container iframe {
  display: block;
  width: 100%;
}
</style>
