import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/restaurantes', name: 'Restaurantes', component: () => import('../views/RestaurantesView.vue') },
  { path: '/usuarios', name: 'Usuarios', component: () => import('../views/UsuariosView.vue') },
  { path: '/clientes', name: 'Clientes', component: () => import('../views/ClientesView.vue') },
  { path: '/menu', name: 'Menu', component: () => import('../views/MenuView.vue') },
  { path: '/ordenes', name: 'Ordenes', component: () => import('../views/OrdenesView.vue') },
  { path: '/reviews', name: 'Reviews', component: () => import('../views/ReviewsView.vue') },
  { path: '/reportes', name: 'Reportes', component: () => import('../views/ReportesView.vue') },
  { path: '/archivos', name: 'Archivos', component: () => import('../views/ArchivosView.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
