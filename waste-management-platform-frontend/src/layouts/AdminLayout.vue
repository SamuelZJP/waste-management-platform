<template>
  <div class="admin-layout">
    <div class="sidebar">
      <div class="logo-container">
        <img src="@/assets/images/logo.svg" alt="智能垃圾管理平台" class="logo" />
        <h1 class="title">智能垃圾管理平台</h1>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        
        <el-sub-menu index="stations">
          <template #title>
            <el-icon><Location /></el-icon>
            <span>垃圾站管理</span>
          </template>
          <el-menu-item index="/admin/stations/map">站点地图</el-menu-item>
          <el-menu-item index="/admin/stations/status">状态监控</el-menu-item>
          <el-menu-item index="/admin/stations/issues">异常处理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="users">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users/list">居民用户</el-menu-item>
          <el-menu-item index="/admin/admins/list">管理员</el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/admin/tasks">
          <el-icon><List /></el-icon>
          <span>任务管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/issues">
          <el-icon><ChatDotRound /></el-icon>
          <span>问题反馈</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/notifications">
          <el-icon><Bell /></el-icon>
          <span>通知消息</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-button 
          :icon="isCollapse ? 'Expand' : 'Fold'" 
          circle
          @click="toggleCollapse"
          class="collapse-button"
        />
      </div>
    </div>
    
    <div class="main-content">
      <div class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta.title">{{ currentRoute.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-space>
            <el-badge :value="unreadNotifications" :max="99" class="notification-badge">
              <el-button icon="Bell" circle @click="goToNotifications" />
            </el-badge>
            
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :src="adminInfo.avatar || ''" :size="32" />
                <span class="username">{{ adminInfo.name || '管理员' }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToProfile">个人资料</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </div>
      </div>
      
      <div class="content">
        <router-view />
      </div>
      
      <div class="footer">
        © 2025 智能垃圾管理平台 版权所有
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import {
  Odometer, Location, User, List, ChatDotRound,
  DataAnalysis, Bell, Setting, Expand, Fold
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const isCollapse = ref(false);
const unreadNotifications = ref(0);

// 管理员信息
const adminInfo = ref({
  name: '',
  avatar: ''
});

// 当前路由
const currentRoute = computed(() => route);

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

// 收起/展开侧边栏
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 跳转到通知页面
const goToNotifications = () => {
  router.push('/admin/notifications');
};

// 跳转到个人资料
const goToProfile = () => {
  router.push('/admin/profile');
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清除token和管理员信息
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    
    // 跳转到登录页
    router.push('/admin/login');
    ElMessage.success('退出登录成功');
  }).catch(() => {
    // 取消退出
  });
};

// 加载管理员信息
const loadAdminInfo = () => {
  const storedAdminInfo = localStorage.getItem('adminInfo');
  if (storedAdminInfo) {
    try {
      adminInfo.value = JSON.parse(storedAdminInfo);
    } catch (error) {
      console.error('解析管理员信息失败:', error);
    }
  }
};

// 获取未读通知数量
const getUnreadNotifications = () => {
  // 模拟获取未读通知数量
  // 实际项目中应调用API获取
  unreadNotifications.value = Math.floor(Math.random() * 10);
};

onMounted(() => {
  loadAdminInfo();
  getUnreadNotifications();
});
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  background-color: #001529;
  color: white;
  width: 220px;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 64px;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.title {
  font-size: 16px;
  color: white;
  margin: 0;
  opacity: 0.85;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border-right: 0;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 0;
  text-align: center;
}

.collapse-button {
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.65);
}

.main-content {
  flex: 1;
  margin-left: 220px;
  transition: margin-left 0.3s;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content.collapsed {
  margin-left: 64px;
}

.header {
  height: 64px;
  background-color: white;
  border-bottom: 1px solid #f0f2f5;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.content {
  flex: 1;
  padding: 24px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px - 48px); /* 减去header和footer的高度 */
}

.footer {
  height: 48px;
  background-color: #f0f2f5;
  border-top: 1px solid #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.notification-badge {
  cursor: pointer;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }
  
  .main-content {
    margin-left: 64px;
  }
  
  .title {
    display: none;
  }
  
  .username {
    display: none;
  }
}
</style> 