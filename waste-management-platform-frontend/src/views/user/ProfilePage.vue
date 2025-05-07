<template>
  <div class="profile-page">
    <div class="page-header">
      <h2 class="page-title">个人中心</h2>
      <p class="page-description">管理您的个人信息和账户设置</p>
    </div>
    
    <el-row :gutter="20">
      <!-- 左侧用户信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="6" :xl="6">
        <div class="left-section">
          <el-card class="user-card">
            <div class="user-avatar-container">
              <el-avatar :size="100" :src="userInfo.avatar" />
              <div class="avatar-change">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleAvatarChange"
                  accept="image/*"
                >
                  <el-button size="small" text>修改头像</el-button>
                </el-upload>
              </div>
            </div>
            <div class="user-info">
              <h3 class="username">{{ userInfo.username }}</h3>
              <p class="join-date">注册时间：{{ userInfo.createTime }}</p>
            </div>
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ userStats.recycleCount }}</div>
                <div class="stat-label">回收次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userStats.points }}</div>
                <div class="stat-label">积分</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userStats.level }}</div>
                <div class="stat-label">等级</div>
              </div>
            </div>
          </el-card>
          
          <el-card class="menu-card">
            <template #header>
              <div class="menu-header">
                <h3>菜单</h3>
              </div>
            </template>
            <div class="menu-list">
              <div 
                class="menu-item" 
                :class="{ 'active': activeTab === 'basic' }"
                @click="activeTab = 'basic'"
              >
                <el-icon><User /></el-icon>
                <span>基本信息</span>
              </div>
              <div 
                class="menu-item" 
                :class="{ 'active': activeTab === 'security' }"
                @click="activeTab = 'security'"
              >
                <el-icon><Lock /></el-icon>
                <span>账号安全</span>
              </div>
              <div 
                class="menu-item" 
                :class="{ 'active': activeTab === 'notification' }"
                @click="activeTab = 'notification'"
              >
                <el-icon><Bell /></el-icon>
                <span>消息设置</span>
              </div>
              <div 
                class="menu-item" 
                :class="{ 'active': activeTab === 'activity' }"
                @click="activeTab = 'activity'"
              >
                <el-icon><List /></el-icon>
                <span>活动记录</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
      
      <!-- 右侧内容区域 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="18" :xl="18">
        <div class="right-section">
          <!-- 基本信息表单 -->
          <el-card v-if="activeTab === 'basic'" class="content-card">
            <template #header>
              <div class="content-header">
                <h3>基本信息</h3>
              </div>
            </template>
            <el-form 
              ref="basicFormRef"
              :model="basicForm" 
              :rules="basicRules" 
              label-width="80px"
            >
              <el-form-item label="用户名" prop="username">
                <el-input v-model="basicForm.username" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="basicForm.phone" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="basicForm.email" />
              </el-form-item>
              <el-form-item label="性别">
                <el-radio-group v-model="basicForm.gender">
                  <el-radio :label="1">男</el-radio>
                  <el-radio :label="2">女</el-radio>
                  <el-radio :label="0">保密</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="地址">
                <el-input v-model="basicForm.address" />
              </el-form-item>
              <el-form-item label="简介">
                <el-input 
                  v-model="basicForm.bio" 
                  type="textarea" 
                  :rows="3" 
                  placeholder="请输入个人简介"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveBasicInfo" :loading="saveLoading">保存</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          
          <!-- 账号安全 -->
          <el-card v-if="activeTab === 'security'" class="content-card">
            <template #header>
              <div class="content-header">
                <h3>账号安全</h3>
              </div>
            </template>
            <div class="security-section">
              <h4>修改密码</h4>
              <el-form 
                ref="passwordFormRef"
                :model="passwordForm" 
                :rules="passwordRules" 
                label-width="100px"
              >
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input 
                    v-model="passwordForm.oldPassword" 
                    type="password" 
                    show-password
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input 
                    v-model="passwordForm.newPassword" 
                    type="password" 
                    show-password
                  />
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirmPassword">
                  <el-input 
                    v-model="passwordForm.confirmPassword" 
                    type="password" 
                    show-password
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="changePassword" :loading="passwordLoading">修改密码</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-divider />
            <div class="security-setting">
              <h4>安全设置</h4>
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">登录手机</div>
                  <div class="security-value">{{ userInfo.phone }}</div>
                </div>
                <el-button link type="primary">修改</el-button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">登录邮箱</div>
                  <div class="security-value">{{ userInfo.email }}</div>
                </div>
                <el-button link type="primary">修改</el-button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">两步验证</div>
                  <div class="security-value">未开启</div>
                </div>
                <el-switch v-model="securitySettings.twoFactor" />
              </div>
              <div class="security-item">
                <div class="security-info">
                  <div class="security-title">登录通知</div>
                  <div class="security-value">已开启</div>
                </div>
                <el-switch v-model="securitySettings.loginNotification" />
              </div>
            </div>
          </el-card>
          
          <!-- 消息设置 -->
          <el-card v-if="activeTab === 'notification'" class="content-card">
            <template #header>
              <div class="content-header">
                <h3>消息设置</h3>
              </div>
            </template>
            <div class="notification-settings">
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">系统通知</div>
                  <div class="setting-desc">接收系统更新、维护等通知</div>
                </div>
                <el-switch v-model="notificationSettings.system" />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">活动通知</div>
                  <div class="setting-desc">接收新活动、优惠等通知</div>
                </div>
                <el-switch v-model="notificationSettings.activity" />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">回收站状态更新</div>
                  <div class="setting-desc">接收附近回收站状态变更通知</div>
                </div>
                <el-switch v-model="notificationSettings.recycleStatus" />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">短信通知</div>
                  <div class="setting-desc">通过短信接收重要通知</div>
                </div>
                <el-switch v-model="notificationSettings.sms" />
              </div>
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-title">邮件通知</div>
                  <div class="setting-desc">通过邮件接收通知</div>
                </div>
                <el-switch v-model="notificationSettings.email" />
              </div>
              <div class="setting-actions">
                <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
              </div>
            </div>
          </el-card>
          
          <!-- 活动记录 -->
          <el-card v-if="activeTab === 'activity'" class="content-card">
            <template #header>
              <div class="content-header">
                <h3>活动记录</h3>
              </div>
            </template>
            <div class="activity-tabs">
              <el-tabs v-model="activityTab">
                <el-tab-pane label="回收记录" name="recycle">
                  <div v-if="activityList.recycle.length > 0">
                    <el-timeline>
                      <el-timeline-item
                        v-for="item in activityList.recycle"
                        :key="item.id"
                        :timestamp="item.time"
                        :type="item.type"
                      >
                        <h4>{{ item.title }}</h4>
                        <p>{{ item.content }}</p>
                      </el-timeline-item>
                    </el-timeline>
                  </div>
                  <el-empty v-else description="暂无回收记录" />
                </el-tab-pane>
                <el-tab-pane label="积分记录" name="points">
                  <div v-if="activityList.points.length > 0">
                    <el-table :data="activityList.points" style="width: 100%">
                      <el-table-column prop="time" label="时间" width="180" />
                      <el-table-column prop="description" label="描述" />
                      <el-table-column prop="points" label="积分变动">
                        <template #default="scope">
                          <span :class="{ 'text-success': scope.row.points > 0, 'text-danger': scope.row.points < 0 }">
                            {{ scope.row.points > 0 ? '+' : '' }}{{ scope.row.points }}
                          </span>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <el-empty v-else description="暂无积分记录" />
                </el-tab-pane>
                <el-tab-pane label="登录记录" name="login">
                  <div v-if="activityList.login.length > 0">
                    <el-table :data="activityList.login" style="width: 100%">
                      <el-table-column prop="time" label="登录时间" width="180" />
                      <el-table-column prop="ip" label="IP地址" />
                      <el-table-column prop="device" label="设备" />
                      <el-table-column prop="location" label="地点" />
                    </el-table>
                  </div>
                  <el-empty v-else description="暂无登录记录" />
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Lock, Bell, List } from '@element-plus/icons-vue';
import { getUserInfo, updateUserInfo, changePassword as changePasswordApi } from '@/services/userService';

// 激活的标签页
const activeTab = ref('basic');
const activityTab = ref('recycle');

// 各种loading状态
const saveLoading = ref(false);
const passwordLoading = ref(false);

// 表单refs
const basicFormRef = ref(null);
const passwordFormRef = ref(null);

// 用户信息
const userInfo = reactive({
  id: 1,
  username: '测试用户',
  phone: '13800138000',
  email: 'test@example.com',
  gender: 1,
  address: '北京市海淀区',
  bio: '热爱环保，从我做起。',
  avatar: '/src/assets/images/avatar-default.svg',
  createTime: '2025-05-01'
});

// 用户统计数据
const userStats = reactive({
  recycleCount: 15,
  points: 230,
  level: 3
});

// 基本信息表单
const basicForm = reactive({
  username: '',
  phone: '',
  email: '',
  gender: 1,
  address: '',
  bio: ''
});

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 安全设置
const securitySettings = reactive({
  twoFactor: false,
  loginNotification: true
});

// 通知设置
const notificationSettings = reactive({
  system: true,
  activity: true,
  recycleStatus: true,
  sms: false,
  email: true
});

// 活动记录
const activityList = reactive({
  recycle: [
    { id: 1, title: '塑料瓶回收', content: '回收了5个塑料瓶', time: '2025-05-05 14:30', type: 'success' },
    { id: 2, title: '废纸回收', content: '回收了2kg废纸', time: '2025-05-03 09:15', type: 'primary' },
    { id: 3, title: '电池回收', content: '回收了10个废旧电池', time: '2025-04-28 16:45', type: 'warning' }
  ],
  points: [
    { id: 1, description: '回收塑料瓶', points: 25, time: '2025-05-05 14:30' },
    { id: 2, description: '回收废纸', points: 20, time: '2025-05-03 09:15' },
    { id: 3, description: '回收电池', points: 50, time: '2025-04-28 16:45' },
    { id: 4, description: '兑换环保袋', points: -100, time: '2025-04-20 11:20' }
  ],
  login: [
    { id: 1, time: '2025-05-06 10:30', ip: '192.168.1.1', device: 'Chrome Windows', location: '北京' },
    { id: 2, time: '2025-05-05 08:15', ip: '192.168.1.2', device: 'Safari iPhone', location: '北京' },
    { id: 3, time: '2025-05-03 19:45', ip: '192.168.1.3', device: 'Chrome Android', location: '上海' }
  ]
});

// 表单验证规则
const basicRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

// 修改头像
const handleAvatarChange = (file) => {
  const isJPG = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png';
  const isLt2M = file.raw.size / 1024 / 1024 < 2;
  
  if (!isJPG) {
    ElMessage.error('头像图片只能是JPG或PNG格式!');
    return false;
  }
  
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过2MB!');
    return false;
  }
  
  // 模拟头像上传成功，实际项目中需要调用API上传
  userInfo.avatar = URL.createObjectURL(file.raw);
  ElMessage.success('头像修改成功');
};

// 保存基本信息
const saveBasicInfo = async () => {
  if (!basicFormRef.value) return;
  
  try {
    await basicFormRef.value.validate();
    saveLoading.value = true;
    
    // 调用API更新用户信息
    const res = await updateUserInfo({
      username: basicForm.username,
      phone: basicForm.phone,
      email: basicForm.email,
      gender: basicForm.gender,
      address: basicForm.address,
      bio: basicForm.bio
    });
    
    if (res.code === 200) {
      ElMessage.success('基本信息更新成功');
      
      // 更新本地用户信息
      Object.assign(userInfo, res.data);
    } else {
      ElMessage.error(res.message || '更新失败');
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
  } finally {
    saveLoading.value = false;
  }
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    await passwordFormRef.value.validate();
    passwordLoading.value = true;
    
    // 调用API修改密码
    const res = await changePasswordApi({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    
    if (res.code === 200) {
      ElMessage.success('密码修改成功');
      
      // 清空表单
      passwordFormRef.value.resetFields();
    } else {
      ElMessage.error(res.message || '修改失败');
    }
  } catch (error) {
    console.error('修改密码失败:', error);
  } finally {
    passwordLoading.value = false;
  }
};

// 保存通知设置
const saveNotificationSettings = () => {
  // 模拟API调用
  setTimeout(() => {
    ElMessage.success('通知设置保存成功');
  }, 500);
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo();
    if (res.code === 200) {
      // 更新用户信息
      Object.assign(userInfo, res.data);
      
      // 初始化表单
      basicForm.username = userInfo.username;
      basicForm.phone = userInfo.phone;
      basicForm.email = userInfo.email;
      basicForm.gender = userInfo.gender;
      basicForm.address = userInfo.address;
      basicForm.bio = userInfo.bio;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.profile-page {
  padding: 20px 0;
}

.left-section {
  margin-bottom: 20px;
}

.user-card {
  margin-bottom: 20px;
  text-align: center;
}

.user-avatar-container {
  position: relative;
  margin-bottom: 15px;
  display: inline-block;
}

.avatar-change {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 100%;
  padding: 5px 0;
  border-bottom-left-radius: 50px;
  border-bottom-right-radius: 50px;
  opacity: 0;
  transition: opacity 0.3s;
}

.user-avatar-container:hover .avatar-change {
  opacity: 1;
}

.username {
  font-size: 18px;
  margin: 5px 0;
}

.join-date {
  color: #999;
  font-size: 14px;
  margin-bottom: 15px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid #eee;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #1e88e5;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.menu-header h3 {
  margin: 0;
  font-size: 16px;
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item.active {
  background-color: #ecf5ff;
  color: #1e88e5;
}

.menu-item .el-icon {
  margin-right: 10px;
}

.content-card {
  margin-bottom: 20px;
}

.content-header h3 {
  margin: 0;
  font-size: 18px;
}

.security-section h4,
.security-setting h4 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
}

.security-item,
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.security-item:last-child,
.setting-item:last-child {
  border-bottom: none;
}

.security-title,
.setting-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.security-value,
.setting-desc {
  color: #666;
  font-size: 14px;
}

.notification-settings {
  padding: 10px 0;
}

.setting-actions {
  margin-top: 20px;
  text-align: right;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .menu-item {
    padding: 15px 10px;
  }
  
  .user-stats {
    margin-top: 15px;
  }
}
</style> 