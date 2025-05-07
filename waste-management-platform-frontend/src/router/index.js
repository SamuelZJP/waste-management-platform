import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { ElMessage } from 'element-plus';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 };
  }
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 智能垃圾管理平台` : '智能垃圾管理平台';
  
  // 在实际项目中，应该根据requiresAdminAuth元数据进行权限验证
  // 以下代码仅为示例，在开发阶段不启用
  /*
  if (to.matched.some(record => record.meta.requiresAdminAuth)) {
    // 检查是否存在管理员token
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      ElMessage.warning('请先登录管理员账号');
      next({ path: '/admin/login', query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } else {
    next();
  }
  */
  
  next();
});

export default router; 