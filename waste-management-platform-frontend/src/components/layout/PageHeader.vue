<template>
  <header class="page-header">
    <div class="logo-container">
      <img src="@/assets/images/logo.svg" alt="Logo" class="logo" />
      <h1 class="title">智能垃圾管理平台</h1>
    </div>
    <div class="nav-container">
      <div class="nav-items">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/waste/search" class="nav-item">垃圾分类查询</router-link>
        <router-link to="/waste/recognize" class="nav-item">垃圾识别</router-link>
        <router-link to="/recycle/map" class="nav-item">回收站地图</router-link>
      </div>
      <div class="user-container">
        <el-dropdown trigger="click">
          <div class="user-info">
            <el-badge :value="unreadCount > 0 ? unreadCount : ''" :hidden="unreadCount <= 0" class="notification-badge">
              <el-icon><BellFilled /></el-icon>
            </el-badge>
            <img :src="userAvatar" alt="Avatar" class="avatar" />
            <span class="username">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToUserProfile">
                <el-icon><User /></el-icon>个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="goToNotifications">
                <el-icon><Bell /></el-icon>我的通知
                <el-badge v-if="unreadCount > 0" :value="unreadCount" class="notification-count" />
              </el-dropdown-item>
              <el-dropdown-item @click="goToFeedback">
                <el-icon><ChatLineRound /></el-icon>问题反馈
              </el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { BellFilled, ArrowDown, User, Bell, ChatLineRound, SwitchButton } from '@element-plus/icons-vue';
import { getUnreadCount } from '@/services/notificationService';

const router = useRouter();
const userName = ref('游客');
const userAvatar = ref('/src/assets/images/avatar-default.svg');
const unreadCount = ref(0);

onMounted(async () => {
  // 从本地存储获取用户信息
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const user = JSON.parse(userInfo);
    userName.value = user.username || '游客';
    userAvatar.value = user.avatar || '/src/assets/images/avatar-default.svg';
  }
  
  // 获取未读通知数量
  try {
    const res = await getUnreadCount();
    if (res.code === 200) {
      unreadCount.value = res.data.unreadCount;
    }
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
  }
});

// 跳转到个人中心
const goToUserProfile = () => {
  router.push('/user/profile');
};

// 跳转到通知页面
const goToNotifications = () => {
  router.push('/notification/list');
};

// 跳转到反馈页面
const goToFeedback = () => {
  router.push('/feedback');
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清除本地存储的用户信息和token
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    
    // 跳转到登录页
    router.push('/user/login');
  }).catch(() => {});
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 10;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #1e88e5;
  margin: 0;
}

.nav-container {
  display: flex;
  align-items: center;
}

.nav-items {
  display: flex;
  margin-right: 20px;
}

.nav-item {
  padding: 0 15px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  line-height: 60px;
  height: 60px;
  display: inline-block;
  transition: all 0.3s;
}

.nav-item:hover, .nav-item.router-link-active {
  color: #1e88e5;
  border-bottom: 2px solid #1e88e5;
}

.user-container {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
}

.username {
  font-size: 14px;
  margin-right: 5px;
}

.notification-badge {
  margin-right: 15px;
}

.notification-count {
  margin-left: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 0 10px;
  }
  
  .title {
    font-size: 16px;
  }
  
  .nav-items {
    display: none;
  }
  
  .username {
    display: none;
  }
}
</style> 