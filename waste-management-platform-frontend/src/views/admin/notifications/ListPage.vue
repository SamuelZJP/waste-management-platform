<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1>通知消息</h1>
      <p class="page-description">管理和查看系统通知、警报和公告信息</p>
    </div>
    
    <!-- 筛选和操作 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="选择通知类型">
            <el-option label="全部类型" value="" />
            <el-option label="系统通知" value="system" />
            <el-option label="警报信息" value="alert" />
            <el-option label="公告" value="announcement" />
            <el-option label="任务" value="task" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态">
            <el-option label="全部状态" value="" />
            <el-option label="未读" value="unread" />
            <el-option label="已读" value="read" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="关键词">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="搜索通知内容" 
            clearable
            @keyup.enter="applyFilter"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 消息统计 -->
    <el-row :gutter="20" class="summary-section">
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-icon system">
            <el-icon><Message /></el-icon>
          </div>
          <div class="summary-content">
            <div class="summary-title">系统通知</div>
            <div class="summary-value">{{ notificationSummary.system }}</div>
            <div class="summary-unread" v-if="notificationSummary.systemUnread > 0">
              {{ notificationSummary.systemUnread }} 条未读
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-icon alert">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="summary-content">
            <div class="summary-title">警报信息</div>
            <div class="summary-value">{{ notificationSummary.alert }}</div>
            <div class="summary-unread" v-if="notificationSummary.alertUnread > 0">
              {{ notificationSummary.alertUnread }} 条未读
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-icon announcement">
            <el-icon><Bell /></el-icon>
          </div>
          <div class="summary-content">
            <div class="summary-title">公告</div>
            <div class="summary-value">{{ notificationSummary.announcement }}</div>
            <div class="summary-unread" v-if="notificationSummary.announcementUnread > 0">
              {{ notificationSummary.announcementUnread }} 条未读
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-icon task">
            <el-icon><Checked /></el-icon>
          </div>
          <div class="summary-content">
            <div class="summary-title">任务</div>
            <div class="summary-value">{{ notificationSummary.task }}</div>
            <div class="summary-unread" v-if="notificationSummary.taskUnread > 0">
              {{ notificationSummary.taskUnread }} 条未读
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 通知列表 -->
    <el-card shadow="hover" class="notifications-card">
      <template #header>
        <div class="card-header">
          <h3>通知列表</h3>
          <div class="header-actions">
            <el-button @click="markAllAsRead" :disabled="!hasUnreadNotifications">
              全部标为已读
            </el-button>
            <el-button type="primary" @click="refreshList">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>
      
      <el-empty 
        v-else-if="notifications.length === 0" 
        description="暂无通知消息" 
      />
      
      <div v-else class="notifications-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id" 
          class="notification-item"
          :class="{'is-unread': !notification.isRead}"
          @click="viewNotification(notification)"
        >
          <div class="notification-icon" :class="notification.type">
            <el-icon v-if="notification.type === 'system'"><Message /></el-icon>
            <el-icon v-else-if="notification.type === 'alert'"><Warning /></el-icon>
            <el-icon v-else-if="notification.type === 'announcement'"><Bell /></el-icon>
            <el-icon v-else-if="notification.type === 'task'"><Checked /></el-icon>
          </div>
          
          <div class="notification-content">
            <div class="notification-header">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-time">{{ notification.time }}</div>
            </div>
            <div class="notification-body">{{ notification.content }}</div>
            <div class="notification-footer" v-if="notification.source">
              <span class="notification-source">来源: {{ notification.source }}</span>
            </div>
          </div>
          
          <div class="notification-actions">
            <el-button 
              link 
              type="primary" 
              size="small"
              @click.stop="markAsRead(notification)"
              v-if="!notification.isRead"
            >
              标为已读
            </el-button>
            <el-dropdown 
              trigger="click" 
              @click.stop
              @command="handleCommand($event, notification)"
            >
              <el-button link>
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view">查看详情</el-dropdown-item>
                  <el-dropdown-item 
                    command="markRead" 
                    v-if="!notification.isRead"
                  >
                    标为已读
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="markUnread" 
                    v-else
                  >
                    标为未读
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalNotifications"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Message, Warning, Bell, Checked, 
  Refresh, MoreFilled
} from '@element-plus/icons-vue';
import { getAdminNotifications } from '@/services/adminService';

const router = useRouter();
const loading = ref(false);
const notifications = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalNotifications = ref(0);

// 筛选表单
const filterForm = ref({
  type: '',
  status: '',
  keyword: ''
});

// 通知统计
const notificationSummary = ref({
  system: 0,
  systemUnread: 0,
  alert: 0,
  alertUnread: 0,
  announcement: 0,
  announcementUnread: 0,
  task: 0,
  taskUnread: 0
});

// 是否有未读通知
const hasUnreadNotifications = computed(() => {
  return notifications.value.some(n => !n.isRead);
});

// 应用筛选
const applyFilter = () => {
  currentPage.value = 1;
  loadNotifications();
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    type: '',
    status: '',
    keyword: ''
  };
  applyFilter();
};

// 查看通知详情
const viewNotification = (notification) => {
  // 标记为已读
  if (!notification.isRead) {
    markAsRead(notification);
  }
  
  // 跳转到详情页
  router.push(`/admin/notifications/${notification.id}`);
};

// 标记为已读
const markAsRead = (notification) => {
  // 实际项目中应调用API标记为已读
  notification.isRead = true;
  updateNotificationSummary();
  ElMessage.success('已标记为已读');
};

// 标记为未读
const markAsUnread = (notification) => {
  // 实际项目中应调用API标记为未读
  notification.isRead = false;
  updateNotificationSummary();
  ElMessage.success('已标记为未读');
};

// 全部标为已读
const markAllAsRead = () => {
  // 实际项目中应调用API全部标记为已读
  notifications.value.forEach(notification => {
    notification.isRead = true;
  });
  updateNotificationSummary();
  ElMessage.success('已全部标记为已读');
};

// 删除通知
const deleteNotification = (notification) => {
  ElMessageBox.confirm(
    '确定要删除该通知吗？',
    '删除通知',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 实际项目中应调用API删除通知
      const index = notifications.value.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        notifications.value.splice(index, 1);
        updateNotificationSummary();
        ElMessage.success('通知已删除');
      }
    })
    .catch(() => {});
};

// 处理下拉菜单命令
const handleCommand = (command, notification) => {
  switch (command) {
    case 'view':
      viewNotification(notification);
      break;
    case 'markRead':
      markAsRead(notification);
      break;
    case 'markUnread':
      markAsUnread(notification);
      break;
    case 'delete':
      deleteNotification(notification);
      break;
  }
};

// 刷新列表
const refreshList = () => {
  loadNotifications();
  ElMessage.success('通知列表已刷新');
};

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadNotifications();
};

// 每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadNotifications();
};

// 更新通知统计
const updateNotificationSummary = () => {
  const summary = {
    system: 0,
    systemUnread: 0,
    alert: 0,
    alertUnread: 0,
    announcement: 0,
    announcementUnread: 0,
    task: 0,
    taskUnread: 0
  };
  
  notifications.value.forEach(notification => {
    summary[notification.type] += 1;
    if (!notification.isRead) {
      summary[`${notification.type}Unread`] += 1;
    }
  });
  
  notificationSummary.value = summary;
};

// 加载通知列表
const loadNotifications = async () => {
  loading.value = true;
  
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filterForm.value
    };
    
    const res = await getAdminNotifications(params);
    if (res.code === 200) {
      notifications.value = res.data.list;
      totalNotifications.value = res.data.total;
      updateNotificationSummary();
    } else {
      throw new Error(res.message || '获取通知列表失败');
    }
  } catch (error) {
    console.error('获取通知列表失败:', error);
    
    // 使用模拟数据
    mockNotificationsData();
    ElMessage.warning('使用模拟数据展示通知列表');
  } finally {
    loading.value = false;
  }
};

// 模拟通知数据
const mockNotificationsData = () => {
  const types = ['system', 'alert', 'announcement', 'task'];
  const titles = [
    '系统升级通知',
    '垃圾站异常警报',
    '回收活动公告',
    '设备维护任务',
    '数据统计报告',
    '用户反馈处理',
    '社区环保活动',
    '垃圾分类指导'
  ];
  
  const sources = [
    '系统管理员',
    '智能监控系统',
    '社区管理处',
    '环保部门',
    '技术支持团队'
  ];
  
  const contents = [
    '系统将于今晚22:00-24:00进行升级维护，期间部分功能可能无法使用，请提前做好工作安排。',
    '7号楼垃圾站压缩设备出现异常，请及时处理。',
    '本周六上午10:00-12:00将在小区广场举办废旧电池回收活动，请各位管理员做好准备工作。',
    '请安排技术人员对5号楼垃圾站的分类设备进行例行维护检查。',
    '上月垃圾分类数据统计报告已生成，请查看并提交反馈意见。',
    '收到业主反映3号楼垃圾站异味问题，请相关人员处理。',
    '环保局将于下周三来小区检查垃圾分类情况，请做好准备工作。',
    '新版垃圾分类指南已上线，请各位管理员熟悉内容并指导居民正确使用。'
  ];
  
  const mockNotifications = [];
  
  // 生成15条模拟通知
  for (let i = 0; i < 15; i++) {
    const typeIndex = Math.floor(Math.random() * types.length);
    const titleIndex = Math.floor(Math.random() * titles.length);
    const contentIndex = Math.floor(Math.random() * contents.length);
    const sourceIndex = Math.floor(Math.random() * sources.length);
    
    const notification = {
      id: `NOTIF-${1000 + i}`,
      type: types[typeIndex],
      title: titles[titleIndex],
      content: contents[contentIndex],
      source: Math.random() > 0.3 ? sources[sourceIndex] : '',
      isRead: Math.random() > 0.4, // 40%概率为未读
      time: new Date(Date.now() - Math.random() * 604800000).toLocaleString() // 随机时间，最近7天内
    };
    
    mockNotifications.push(notification);
  }
  
  // 确保有未读通知
  if (!mockNotifications.some(n => !n.isRead)) {
    mockNotifications[0].isRead = false;
  }
  
  // 确保有各种类型的通知
  types.forEach((type, index) => {
    if (!mockNotifications.some(n => n.type === type)) {
      mockNotifications[index].type = type;
    }
  });
  
  notifications.value = mockNotifications;
  totalNotifications.value = mockNotifications.length;
  updateNotificationSummary();
};

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notifications-page {
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

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.summary-section {
  margin-bottom: 20px;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 20px;
  height: 100%;
  margin-bottom: 20px;
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  color: white;
}

.summary-icon.system {
  background-color: #409eff;
}

.summary-icon.alert {
  background-color: #f56c6c;
}

.summary-icon.announcement {
  background-color: #e6a23c;
}

.summary-icon.task {
  background-color: #67c23a;
}

.summary-content {
  flex: 1;
}

.summary-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.summary-unread {
  font-size: 12px;
  color: #f56c6c;
}

.notifications-card {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.loading-container {
  padding: 20px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.is-unread {
  background-color: #ecf5ff;
}

.notification-item.is-unread:hover {
  background-color: #e0f0ff;
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

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
  flex-shrink: 0;
}

.notification-body {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-footer {
  font-size: 12px;
  color: #909399;
}

.notification-actions {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
    width: 100%;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .summary-card {
    margin-bottom: 15px;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notification-time {
    margin-left: 0;
    margin-top: 5px;
  }
  
  .notification-actions {
    flex-direction: column;
  }
}
</style> 