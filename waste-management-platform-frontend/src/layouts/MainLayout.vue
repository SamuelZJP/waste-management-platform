<template>
  <div class="main-layout">
    <PageHeader />
    <div class="main-content">
      <router-view />
    </div>
    <PageFooter />
  </div>
</template>

<script setup>
import PageHeader from '@/components/layout/PageHeader.vue';
import PageFooter from '@/components/layout/PageFooter.vue';
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 10px;
  }
}
</style> 