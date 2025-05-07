<template>
  <footer class="page-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>关于我们</h3>
        <p>智能垃圾管理平台是一个面向小区、公园等局部区域的垃圾分类和管理系统，旨在提高垃圾分类效率，优化垃圾回收流程，实现智能化管理。</p>
      </div>
      <div class="footer-section">
        <h3>联系方式</h3>
        <p><i class="el-icon-phone"></i> 电话: 010-12345678</p>
        <p><i class="el-icon-message"></i> 邮箱: support@waste-management.com</p>
      </div>
      <div class="footer-section">
        <h3>快速链接</h3>
        <ul>
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/waste/search">垃圾分类查询</router-link></li>
          <li><router-link to="/waste/recognize">垃圾识别</router-link></li>
          <li><router-link to="/recycle/map">回收站地图</router-link></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 智能垃圾管理平台 版权所有</p>
    </div>
  </footer>
</template>

<script setup>
// 页脚组件逻辑
</script>

<style scoped>
.page-footer {
  background-color: #24292e;
  color: #fff;
  padding: 30px 20px;
  margin-top: 50px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section {
  width: 30%;
  margin-bottom: 20px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #1e88e5;
}

.footer-section p {
  line-height: 1.6;
  font-size: 14px;
  color: #ccc;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section ul li a:hover {
  color: #1e88e5;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #444;
}

.footer-bottom p {
  font-size: 12px;
  color: #aaa;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-section {
    width: 100%;
  }
  
  .footer-content {
    flex-direction: column;
  }
}
</style> 