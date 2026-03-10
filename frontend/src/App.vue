<script setup>
import Sidebar from './components/layout/Sidebar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  margin-left: 220px;
  padding: 24px 32px;
  background: #f0f2f5;
  min-height: 100vh;
}
</style>
