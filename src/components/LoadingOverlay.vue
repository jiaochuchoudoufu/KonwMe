<template>
    <div v-if="visible" class="loading-overlay">
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>{{ text }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    visible: boolean
    text?: string
}>()
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f0f0f0;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>