<template>
  <div class="confirm-overlay" @click.self="$emit('cancel')">
    <div class="confirm-box">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="confirm-actions">
        <button class="btn" @click="$emit('cancel')">Cancelar</button>
        <button class="btn" :class="danger ? 'btn-danger-fill' : 'btn-primary'" @click="$emit('confirm')">
          {{ confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, default: '¿Estás seguro de realizar esta acción?' },
  confirmText: { type: String, default: 'Confirmar' },
  danger: { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}
.confirm-box {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.confirm-box h3 {
  margin: 0 0 8px;
}
.confirm-box p {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.92rem;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-danger-fill {
  background: #e94560;
  color: #fff;
  border-color: #e94560;
}
.btn-danger-fill:hover {
  background: #d63851;
}
</style>
