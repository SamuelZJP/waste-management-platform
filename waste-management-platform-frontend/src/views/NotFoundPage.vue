<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="not-found-title">404</h1>
        <div class="not-found-divider"></div>
        <h2 class="not-found-subtitle">页面不存在</h2>
        <p class="not-found-desc">抱歉，您访问的页面不存在或已被移除</p>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.not-found-container {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

.not-found-title {
  font-size: 80px;
  color: #1e88e5;
  margin: 0;
  line-height: 1;
}

.not-found-divider {
  height: 4px;
  width: 60px;
  background-color: #1e88e5;
  margin: 20px auto;
  border-radius: 2px;
}

.not-found-subtitle {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}

.not-found-desc {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}
</style> 