<template>
  <aside class="sidebar">
    <div class="logo-section">
      <img src="@/assets/logo.png" alt="Castor's Pizza" class="logo-img" />
    </div>
    <nav>
      <router-link to="/" class="nav-item">
        <LayoutDashboard :size="18" /> Dashboard
      </router-link>
      <router-link to="/restaurantes" class="nav-item">
        <Store :size="18" /> Restaurantes
      </router-link>
      <router-link to="/usuarios" class="nav-item">
        <UserCog :size="18" /> Usuarios
      </router-link>
      <router-link to="/clientes" class="nav-item">
        <Users :size="18" /> Clientes
      </router-link>
      <router-link to="/menu" class="nav-item">
        <UtensilsCrossed :size="18" /> Menu
      </router-link>
      <router-link to="/ordenes" class="nav-item">
        <ClipboardList :size="18" /> Ordenes
      </router-link>
      <router-link to="/reviews" class="nav-item">
        <Star :size="18" /> Reseñas
      </router-link>
      <router-link to="/reportes" class="nav-item">
        <BarChart3 :size="18" /> Reportes
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import {
  LayoutDashboard, Store, UserCog, Users, UtensilsCrossed,
  ClipboardList, Star, BarChart3
} from 'lucide-vue-next'
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: #1a1a2e;
  color: #eee;
  display: flex;
  flex-direction: column;
  padding: 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}
.logo-section {
  padding: 16px;
  border-bottom: 1px solid #333;
  text-align: center;
  background: #1a1a2e;
}
.logo-img {
  max-width: 140px;
  height: auto;
  border-radius: 8px;
  border: 2px solid #333;
}
nav {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: #ccc;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.2s, color 0.2s;
}
.nav-item:hover {
  background: #16213e;
  color: #fff;
}
.nav-item.router-link-active {
  background: #e94560;
  color: #fff;
}
</style>
