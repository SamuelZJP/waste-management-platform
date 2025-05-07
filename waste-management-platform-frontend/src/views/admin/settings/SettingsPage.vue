<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>系统设置</h1>
      <p class="page-description">管理系统参数配置和个性化设置</p>
    </div>
    
    <!-- 基本设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>基本设置</h3>
        </div>
      </template>
      
      <el-form :model="basicSettings" label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="basicSettings.systemName" placeholder="智能垃圾分类管理平台" />
        </el-form-item>
        
        <el-form-item label="社区名称">
          <el-input v-model="basicSettings.communityName" placeholder="请输入社区名称" />
        </el-form-item>
        
        <el-form-item label="联系电话">
          <el-input v-model="basicSettings.contactPhone" placeholder="服务热线" />
        </el-form-item>
        
        <el-form-item label="管理员邮箱">
          <el-input v-model="basicSettings.adminEmail" placeholder="管理员联系邮箱" />
        </el-form-item>
        
        <el-form-item label="系统语言">
          <el-select v-model="basicSettings.language" style="width: 100%">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 通知设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>通知设置</h3>
        </div>
      </template>
      
      <el-form :model="notificationSettings" label-width="120px">
        <el-form-item label="系统通知">
          <el-switch v-model="notificationSettings.enableSystemNotify" />
        </el-form-item>
        
        <el-form-item label="设备预警通知">
          <el-switch v-model="notificationSettings.enableDeviceAlert" />
        </el-form-item>
        
        <el-form-item label="容量预警阈值">
          <el-slider 
            v-model="notificationSettings.capacityThreshold" 
            :min="50" 
            :max="95" 
            :step="5"
            :format-tooltip="value => `${value}%`"
            :disabled="!notificationSettings.enableDeviceAlert"
          />
        </el-form-item>
        
        <el-form-item label="通知接收方式">
          <el-checkbox-group v-model="notificationSettings.notifyMethods">
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="app">App推送</el-checkbox>
            <el-checkbox label="wechat">微信</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据安全设置 -->
    <el-card shadow="hover" class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>数据安全</h3>
        </div>
      </template>
      
      <el-form :model="securitySettings" label-width="120px">
        <el-form-item label="数据备份">
          <el-switch v-model="securitySettings.enableBackup" />
        </el-form-item>
        
        <el-form-item label="备份频率" v-if="securitySettings.enableBackup">
          <el-select v-model="securitySettings.backupFrequency" style="width: 100%">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日志保留时间">
          <el-select v-model="securitySettings.logRetention" style="width: 100%">
            <el-option label="30天" value="30" />
            <el-option label="90天" value="90" />
            <el-option label="180天" value="180" />
            <el-option label="365天" value="365" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button @click="resetSettings">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getSystemSettings, updateSystemSettings } from '@/services/adminService';

// 基本设置
const basicSettings = ref({
  systemName: '智能垃圾分类管理平台',
  communityName: '阳光花园小区',
  contactPhone: '400-123-4567',
  adminEmail: 'admin@example.com',
  language: 'zh-CN'
});

// 通知设置
const notificationSettings = ref({
  enableSystemNotify: true,
  enableDeviceAlert: true,
  capacityThreshold: 80,
  notifyMethods: ['email', 'app']
});

// 安全设置
const securitySettings = ref({
  enableBackup: true,
  backupFrequency: 'daily',
  logRetention: '90'
});

// 原始设置数据，用于重置
const originalSettings = ref({});

// 加载系统设置
const loadSettings = async () => {
  try {
    const res = await getSystemSettings();
    if (res && res.code === 200) {
      const { basic, notification, security } = res.data;
      
      if (basic) {
        basicSettings.value = { ...basic };
      }
      
      if (notification) {
        notificationSettings.value = { ...notification };
      }
      
      if (security) {
        securitySettings.value = { ...security };
      }
      
      // 保存原始设置，用于重置
      originalSettings.value = {
        basic: { ...basicSettings.value },
        notification: { ...notificationSettings.value },
        security: { ...securitySettings.value }
      };
    }
  } catch (error) {
    console.error('获取系统设置失败:', error);
  }
};

// 保存设置
const saveSettings = async () => {
  try {
    const settingsData = {
      basic: basicSettings.value,
      notification: notificationSettings.value,
      security: securitySettings.value
    };
    
    const res = await updateSystemSettings(settingsData);
    if (res && res.code === 200) {
      ElMessage.success('设置已保存');
      // 更新原始设置
      originalSettings.value = { ...settingsData };
    } else {
      ElMessage.error(res.message || '保存失败');
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    ElMessage.error('保存设置失败，请稍后重试');
  }
};

// 重置设置
const resetSettings = () => {
  if (originalSettings.value.basic) {
    basicSettings.value = { ...originalSettings.value.basic };
  }
  
  if (originalSettings.value.notification) {
    notificationSettings.value = { ...originalSettings.value.notification };
  }
  
  if (originalSettings.value.security) {
    securitySettings.value = { ...originalSettings.value.security };
  }
  
  ElMessage.info('设置已重置');
};

// 初始化
onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  margin: 0 0 8px 0;
  color: #333;
}

.page-description {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.settings-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 40px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}
</style> 