<template>
  <div class="blank-layout">
    <router-view />
  </div>
</template>

<script setup>
// 空白布局不需要额外逻辑
</script>

<style scoped>
.blank-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}
</style> 