<template>
  <div class="notification-detail-page">
    <div class="page-header">
      <h1>通知详情</h1>
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon><Back /></el-icon> 返回列表
        </el-button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <el-result
      v-else-if="!notification"
      icon="error"
      title="找不到通知"
      sub-title="请确认通知ID是否正确或该通知是否已被删除"
    >
      <template #extra>
        <el-button type="primary" @click="goBack">返回通知列表</el-button>
      </template>
    </el-result>
    
    <template v-else>
      <!-- 通知内容卡片 -->
      <el-card shadow="hover" class="notification-card">
        <div class="notification-header">
          <div class="notification-title-row">
            <div class="notification-icon" :class="notification.type">
              <el-icon v-if="notification.type === 'system'"><Message /></el-icon>
              <el-icon v-else-if="notification.type === 'alert'"><Warning /></el-icon>
              <el-icon v-else-if="notification.type === 'announcement'"><Bell /></el-icon>
              <el-icon v-else-if="notification.type === 'task'"><Checked /></el-icon>
            </div>
            <div class="notification-title">{{ notification.title }}</div>
            <el-tag 
              v-if="!notification.isRead" 
              size="small" 
              type="danger"
              @click="markAsRead"
              style="cursor: pointer;"
            >
              未读
            </el-tag>
            <el-tag 
              v-else 
              size="small" 
              type="info"
              style="cursor: pointer;"
              @click="markAsUnread"
            >
              已读
            </el-tag>
          </div>
          
          <div class="notification-meta">
            <div class="meta-item">
              <span class="meta-label">发送时间：</span>
              <span class="meta-value">{{ notification.time }}</span>
            </div>
            <div class="meta-item" v-if="notification.source">
              <span class="meta-label">来源：</span>
              <span class="meta-value">{{ notification.source }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">类型：</span>
              <span class="meta-value">
                <el-tag 
                  size="small" 
                  :type="getTypeTagType(notification.type)"
                >
                  {{ getTypeLabel(notification.type) }}
                </el-tag>
              </span>
            </div>
            <div class="meta-item" v-if="notification.readTime">
              <span class="meta-label">阅读时间：</span>
              <span class="meta-value">{{ notification.readTime }}</span>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="notification-content">
          <div class="content-html" v-if="notification.contentHtml" v-html="notification.contentHtml"></div>
          <div class="content-text" v-else>
            <p v-for="(paragraph, index) in contentParagraphs" :key="index">
              {{ paragraph }}
            </p>
          </div>
          
          <!-- 附件区域 -->
          <div class="attachments" v-if="notification.attachments && notification.attachments.length > 0">
            <h3>附件</h3>
            <el-space wrap>
              <el-card 
                v-for="(attachment, index) in notification.attachments" 
                :key="index"
                shadow="hover" 
                class="attachment-card"
              >
                <div class="attachment-icon">
                  <el-icon v-if="isImageFile(attachment.name)"><Picture /></el-icon>
                  <el-icon v-else-if="isPdfFile(attachment.name)"><Document /></el-icon>
                  <el-icon v-else><Files /></el-icon>
                </div>
                <div class="attachment-info">
                  <div class="attachment-name">{{ attachment.name }}</div>
                  <div class="attachment-size">{{ formatFileSize(attachment.size) }}</div>
                </div>
                <div class="attachment-actions">
                  <el-button link type="primary">下载</el-button>
                  <el-button link type="primary" v-if="isImageFile(attachment.name)">预览</el-button>
                </div>
              </el-card>
            </el-space>
          </div>
        </div>
      </el-card>
      
      <!-- 相关操作卡片 -->
      <el-card shadow="hover" class="actions-card">
        <template #header>
          <div class="card-header">
            <h3>操作</h3>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-button 
              type="primary" 
              @click="markAsRead" 
              :disabled="notification.isRead" 
              block
            >
              标记为已读
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button 
              @click="markAsUnread" 
              :disabled="!notification.isRead" 
              block
            >
              标记为未读
            </el-button>
          </el-col>
        </el-row>
        
        <el-divider />
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-button 
              type="primary" 
              v-if="notification.type === 'task'" 
              icon="Check"
              block
            >
              处理任务
            </el-button>
            
            <el-button 
              type="primary" 
              v-else-if="notification.type === 'alert'" 
              icon="Connection"
              block
            >
              查看异常
            </el-button>
            
            <el-button 
              type="primary" 
              v-else
              icon="Flag"
              block
            >
              标记重要
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button 
              type="danger" 
              icon="Delete" 
              @click="confirmDelete"
              block
            >
              删除通知
            </el-button>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 相关通知卡片 -->
      <el-card shadow="hover" class="related-card" v-if="relatedNotifications.length > 0">
        <template #header>
          <div class="card-header">
            <h3>相关通知</h3>
          </div>
        </template>
        
        <div class="related-list">
          <el-table :data="relatedNotifications" style="width: 100%">
            <el-table-column prop="title" label="标题" min-width="250">
              <template #default="scope">
                <el-link 
                  :type="scope.row.isRead ? 'info' : 'primary'"
                  :underline="false"
                  @click="viewRelatedNotification(scope.row)"
                >
                  {{ scope.row.title }}
                  <el-tag 
                    v-if="!scope.row.isRead" 
                    size="small" 
                    effect="plain"
                    type="danger"
                    class="ml-2"
                  >
                    未读
                  </el-tag>
                </el-link>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="120">
              <template #default="scope">
                <el-tag 
                  size="small" 
                  :type="getTypeTagType(scope.row.type)"
                >
                  {{ getTypeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="180" />
          </el-table>
        </div>
      </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Message, Warning, Bell, Checked, Back,
  Picture, Document, Files
} from '@element-plus/icons-vue';
import { getNotificationDetail, updateNotificationStatus } from '@/services/adminService';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const notification = ref(null);
const relatedNotifications = ref([]);

// 获取通知类型标签
const getTypeLabel = (type) => {
  switch (type) {
    case 'system': return '系统通知';
    case 'alert': return '警报信息';
    case 'announcement': return '公告';
    case 'task': return '任务';
    default: return '其他';
  }
};

// 获取通知类型对应的标签类型
const getTypeTagType = (type) => {
  switch (type) {
    case 'system': return 'primary';
    case 'alert': return 'danger';
    case 'announcement': return 'warning';
    case 'task': return 'success';
    default: return 'info';
  }
};

// 判断是否为图片文件
const isImageFile = (filename) => {
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return extensions.some(ext => filename.toLowerCase().endsWith(ext));
};

// 判断是否为PDF文件
const isPdfFile = (filename) => {
  return filename.toLowerCase().endsWith('.pdf');
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// 将内容文本分割为段落
const contentParagraphs = computed(() => {
  if (!notification.value || !notification.value.content) return [];
  return notification.value.content.split('\n').filter(p => p.trim() !== '');
});

// 返回通知列表
const goBack = () => {
  router.push('/admin/notifications');
};

// 标记为已读
const markAsRead = async () => {
  if (!notification.value || notification.value.isRead) return;
  
  try {
    // 实际项目中应调用API
    // await updateNotificationStatus(notification.value.id, true);
    
    notification.value.isRead = true;
    notification.value.readTime = new Date().toLocaleString();
    ElMessage.success('已标记为已读');
  } catch (error) {
    console.error('标记为已读失败:', error);
    ElMessage.error('标记为已读失败');
  }
};

// 标记为未读
const markAsUnread = async () => {
  if (!notification.value || !notification.value.isRead) return;
  
  try {
    // 实际项目中应调用API
    // await updateNotificationStatus(notification.value.id, false);
    
    notification.value.isRead = false;
    notification.value.readTime = null;
    ElMessage.success('已标记为未读');
  } catch (error) {
    console.error('标记为未读失败:', error);
    ElMessage.error('标记为未读失败');
  }
};

// 删除通知
const confirmDelete = () => {
  ElMessageBox.confirm(
    '确定要删除该通知吗？删除后将无法恢复。',
    '删除通知',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 实际项目中应调用API删除通知
      ElMessage.success('通知已删除');
      router.push('/admin/notifications');
    })
    .catch(() => {});
};

// 查看相关通知
const viewRelatedNotification = (notification) => {
  router.push(`/admin/notifications/${notification.id}`);
};

// 加载通知详情
const loadNotificationDetail = async () => {
  loading.value = true;
  
  try {
    const notificationId = route.params.id;
    
    // 实际项目中应调用API获取通知详情
    // const response = await getNotificationDetail(notificationId);
    // notification.value = response.data;
    
    // 模拟数据
    mockNotificationDetail(notificationId);
    loadRelatedNotifications();
  } catch (error) {
    console.error('获取通知详情失败:', error);
    ElMessage.error('获取通知详情失败');
    notification.value = null;
  } finally {
    loading.value = false;
  }
};

// 加载相关通知
const loadRelatedNotifications = () => {
  // 实际项目中应调用API获取相关通知
  
  // 模拟数据
  relatedNotifications.value = [
    {
      id: 'NOTIF-1001',
      title: '系统升级计划通知',
      type: 'system',
      isRead: true,
      time: '2023-08-15 09:30:00'
    },
    {
      id: 'NOTIF-1003',
      title: '垃圾分类新规则发布',
      type: 'announcement',
      isRead: false,
      time: '2023-08-14 11:20:00'
    },
    {
      id: 'NOTIF-1005',
      title: '3号站点设备故障',
      type: 'alert',
      isRead: true,
      time: '2023-08-13 16:45:00'
    }
  ];
};

// 模拟通知详情数据
const mockNotificationDetail = (id) => {
  const types = ['system', 'alert', 'announcement', 'task'];
  const typeIndex = Math.floor(Math.random() * types.length);
  
  notification.value = {
    id: id,
    type: types[typeIndex],
    title: '系统升级维护通知',
    content: `尊敬的管理员：\n\n我们计划于2023年8月20日22:00至8月21日02:00进行系统升级维护，期间系统将暂停服务。\n\n本次升级主要内容：\n1. 优化系统性能，提高响应速度\n2. 增加数据分析功能，提供更全面的数据可视化\n3. 修复已知bug，提升系统稳定性\n4. 更新安全模块，增强系统安全性\n\n请各位管理员提前安排工作，并通知相关人员。若有特殊情况需要处理，请联系技术支持团队。\n\n感谢您的理解与配合！`,
    contentHtml: null, // 如果需要支持HTML格式，可以设置此字段
    time: '2023-08-15 10:30:00',
    isRead: Math.random() > 0.5,
    readTime: Math.random() > 0.5 ? '2023-08-15 11:05:23' : null,
    source: '系统管理员',
    attachments: [
      {
        name: '系统升级说明.pdf',
        size: 2567890,
        url: '#'
      },
      {
        name: '升级进度计划表.xlsx',
        size: 987540,
        url: '#'
      },
      {
        name: '界面预览图.png',
        size: 1458960,
        url: '#'
      }
    ]
  };
};

onMounted(() => {
  loadNotificationDetail();
});
</script>

<style scoped>
.notification-detail-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.loading-container {
  padding: 20px;
}

.notification-card,
.actions-card,
.related-card {
  margin-bottom: 20px;
}

.notification-header {
  margin-bottom: 20px;
}

.notification-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  flex-shrink: 0;
  color: white;
}

.notification-icon.system {
  background-color: #409eff;
}

.notification-icon.alert {
  background-color: #f56c6c;
}

.notification-icon.announcement {
  background-color: #e6a23c;
}

.notification-icon.task {
  background-color: #67c23a;
}

.notification-title {
  font-size: 18px;
  font-weight: bold;
  margin-right: 15px;
  flex: 1;
}

.notification-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  color: #909399;
  margin-right: 5px;
}

.notification-content {
  font-size: 15px;
  line-height: 1.6;
  color: #303133;
}

.content-text p {
  margin-bottom: 16px;
}

.content-text p:last-child {
  margin-bottom: 0;
}

.attachments {
  margin-top: 30px;
}

.attachments h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #303133;
}

.attachment-card {
  width: 220px;
  display: flex;
  flex-direction: column;
}

.attachment-icon {
  font-size: 32px;
  color: #909399;
  margin-bottom: 10px;
  text-align: center;
}

.attachment-info {
  text-align: center;
  margin-bottom: 10px;
}

.attachment-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 5px;
}

.attachment-size {
  font-size: 12px;
  color: #909399;
}

.attachment-actions {
  display: flex;
  justify-content: center;
  margin-top: auto;
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

.related-list {
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .notification-title-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notification-icon {
    margin-bottom: 10px;
  }
  
  .notification-title {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .notification-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .attachment-card {
    width: 100%;
  }
}
</style> 