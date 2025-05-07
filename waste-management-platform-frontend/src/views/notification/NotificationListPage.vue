<template>
  <div class="notification-page">
    <div class="page-header">
      <h2 class="page-title">通知中心</h2>
      <p class="page-description">查看您的系统通知和活动信息</p>
    </div>
    
    <el-card class="filter-card">
      <div class="filter-container">
        <div class="filter-item">
          <span class="filter-label">通知类型:</span>
          <el-radio-group v-model="filterType" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="system">系统通知</el-radio-button>
            <el-radio-button label="activity">活动通知</el-radio-button>
            <el-radio-button label="recycle">回收站通知</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-item">
          <span class="filter-label">状态:</span>
          <el-radio-group v-model="filterStatus" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="unread">未读</el-radio-button>
            <el-radio-button label="read">已读</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-actions">
          <el-button type="primary" size="small" @click="markAllAsRead" v-if="hasUnreadNotifications">
            全部标为已读
          </el-button>
          <el-button type="danger" size="small" @click="deleteAllRead" v-if="hasReadNotifications">
            删除已读通知
          </el-button>
        </div>
      </div>
    </el-card>
    
    <div class="notification-list" v-if="filteredNotifications.length > 0">
      <el-timeline>
        <el-timeline-item
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :type="getNotificationType(notification.type)"
          :timestamp="notification.time"
          :hollow="notification.isRead"
        >
          <el-card class="notification-card" :class="{ 'unread': !notification.isRead }">
            <div class="notification-header">
              <div class="notification-title">
                <el-tag :type="getTagType(notification.type)" size="small" effect="plain">
                  {{ getTypeText(notification.type) }}
                </el-tag>
                <h4>{{ notification.title }}</h4>
              </div>
              <div class="notification-actions">
                <el-button 
                  v-if="!notification.isRead" 
                  size="small" 
                  text 
                  @click="markAsRead(notification.id)"
                >
                  标为已读
                </el-button>
                <el-button 
                  size="small" 
                  text 
                  type="danger" 
                  @click="deleteNotification(notification.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
            <div class="notification-content" v-html="notification.content"></div>
            <div class="notification-footer" v-if="notification.link">
              <el-button 
                type="primary" 
                link 
                :icon="ArrowRight" 
                @click="goToLink(notification.link)"
              >
                {{ notification.linkText || '查看详情' }}
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalNotifications"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <el-empty 
      v-else 
      description="暂无通知" 
      :image-size="200"
    >
      <template #description>
        <p>{{ getEmptyText() }}</p>
      </template>
    </el-empty>
    
    <!-- 通知详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentNotification.title || '通知详情'"
      width="600px"
      center
    >
      <div class="notification-detail">
        <div class="notification-meta">
          <el-tag :type="getTagType(currentNotification.type)" effect="plain">
            {{ getTypeText(currentNotification.type) }}
          </el-tag>
          <span class="notification-time">{{ currentNotification.time }}</span>
        </div>
        <div class="notification-detail-content" v-html="currentNotification.content"></div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            type="primary" 
            @click="goToLinkAndClose" 
            v-if="currentNotification.link"
          >
            {{ currentNotification.linkText || '查看详情' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowRight } from '@element-plus/icons-vue';
import { getNotifications, markAsRead as markAsReadApi, deleteNotification as deleteNotificationApi } from '@/services/notificationService';

const router = useRouter();

// 筛选条件
const filterType = ref('all');
const filterStatus = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框
const dialogVisible = ref(false);
const currentNotification = reactive({
  id: '',
  title: '',
  content: '',
  type: '',
  time: '',
  isRead: false,
  link: '',
  linkText: ''
});

// 通知列表
const notifications = ref([]);
const totalNotifications = ref(0);

// 加载通知
const loadNotifications = async () => {
  try {
    const res = await getNotifications({
      type: filterType.value !== 'all' ? filterType.value : undefined,
      status: filterStatus.value !== 'all' ? filterStatus.value : undefined,
      page: currentPage.value,
      pageSize: pageSize.value
    });
    
    if (res.code === 200) {
      notifications.value = res.data.list;
      totalNotifications.value = res.data.total;
    } else {
      ElMessage.error(res.message || '获取通知失败');
    }
  } catch (error) {
    console.error('获取通知失败:', error);
    // 使用模拟数据
    setupMockData();
  }
};

// 设置模拟数据
const setupMockData = () => {
  // 模拟通知数据
  notifications.value = [
    {
      id: '1',
      title: '系统维护通知',
      content: '尊敬的用户，我们将于2025年6月1日凌晨2:00-4:00进行系统维护，期间部分功能可能无法正常使用，请您谅解。',
      type: 'system',
      time: '2025-05-30 14:30',
      isRead: false
    },
    {
      id: '2',
      title: '新活动上线',
      content: '环保积分大派送！即日起至6月30日，每日完成回收任务可获双倍积分，赶紧参与吧！',
      type: 'activity',
      time: '2025-05-29 10:15',
      isRead: true,
      link: '/activity/detail/1',
      linkText: '查看活动'
    },
    {
      id: '3',
      title: '附近回收站状态更新',
      content: '您关注的<strong>海淀区西二旗回收站</strong>目前状态已更新为"已满"，建议您前往其他回收点。',
      type: 'recycle',
      time: '2025-05-28 16:45',
      isRead: false,
      link: '/recycle/map',
      linkText: '查看地图'
    },
    {
      id: '4',
      title: '积分到账通知',
      content: '恭喜您完成回收任务，获得20积分奖励！您当前的积分余额为230分。',
      type: 'activity',
      time: '2025-05-27 09:30',
      isRead: true
    },
    {
      id: '5',
      title: '回收记录已生成',
      content: '您的回收记录已生成，本次回收5个塑料瓶、2kg废纸，感谢您为环保事业做出的贡献！',
      type: 'recycle',
      time: '2025-05-26 15:20',
      isRead: false,
      link: '/user/profile?tab=activity',
      linkText: '查看记录'
    },
    {
      id: '6',
      title: '账号安全提醒',
      content: '我们检测到您的账号在新设备上登录，如非本人操作，请及时修改密码。',
      type: 'system',
      time: '2025-05-25 20:10',
      isRead: true
    }
  ];
  
  totalNotifications.value = notifications.value.length;
};

// 筛选通知
const filteredNotifications = computed(() => {
  return notifications.value.filter(item => {
    // 类型筛选
    if (filterType.value !== 'all' && item.type !== filterType.value) {
      return false;
    }
    
    // 状态筛选
    if (filterStatus.value === 'read' && !item.isRead) {
      return false;
    }
    
    if (filterStatus.value === 'unread' && item.isRead) {
      return false;
    }
    
    return true;
  });
});

// 是否有未读通知
const hasUnreadNotifications = computed(() => {
  return notifications.value.some(item => !item.isRead);
});

// 是否有已读通知
const hasReadNotifications = computed(() => {
  return notifications.value.some(item => item.isRead);
});

// 获取空状态文本
const getEmptyText = () => {
  if (filterType.value !== 'all') {
    return `暂无${getTypeText(filterType.value)}`;
  }
  
  if (filterStatus.value === 'unread') {
    return '暂无未读通知';
  }
  
  if (filterStatus.value === 'read') {
    return '暂无已读通知';
  }
  
  return '暂无通知';
};

// 获取通知类型文本
const getTypeText = (type) => {
  switch (type) {
    case 'system':
      return '系统通知';
    case 'activity':
      return '活动通知';
    case 'recycle':
      return '回收站通知';
    default:
      return '通知';
  }
};

// 获取通知类型样式
const getNotificationType = (type) => {
  switch (type) {
    case 'system':
      return 'warning';
    case 'activity':
      return 'success';
    case 'recycle':
      return 'primary';
    default:
      return 'info';
  }
};

// 获取标签类型
const getTagType = (type) => {
  switch (type) {
    case 'system':
      return 'warning';
    case 'activity':
      return 'success';
    case 'recycle':
      return 'primary';
    default:
      return 'info';
  }
};

// 查看通知详情
const viewNotificationDetail = (notification) => {
  Object.assign(currentNotification, notification);
  dialogVisible.value = true;
  
  // 如果未读，标记为已读
  if (!notification.isRead) {
    markAsRead(notification.id);
  }
};

// 标记为已读
const markAsRead = async (id) => {
  try {
    // 调用API标记为已读
    const res = await markAsReadApi(id);
    
    if (res && res.code === 200) {
      // 更新本地状态
      const notification = notifications.value.find(item => item.id === id);
      if (notification) {
        notification.isRead = true;
      }
      
      ElMessage.success('已标记为已读');
    }
  } catch (error) {
    console.error('标记已读失败:', error);
    
    // 模拟API调用成功
    const notification = notifications.value.find(item => item.id === id);
    if (notification) {
      notification.isRead = true;
    }
  }
};

// 全部标为已读
const markAllAsRead = async () => {
  try {
    ElMessageBox.confirm('确定将所有通知标记为已读吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      // 调用API标记全部为已读
      // 在实际项目中需要调用API
      // 这里模拟API调用
      notifications.value.forEach(item => {
        item.isRead = true;
      });
      
      ElMessage.success('全部已标记为已读');
    });
  } catch (error) {
    console.error('标记全部已读失败:', error);
  }
};

// 删除通知
const deleteNotification = async (id) => {
  try {
    ElMessageBox.confirm('确定删除该通知吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      // 调用API删除通知
      const res = await deleteNotificationApi(id);
      
      if (res && res.code === 200) {
        // 更新本地状态
        notifications.value = notifications.value.filter(item => item.id !== id);
        totalNotifications.value--;
        
        ElMessage.success('删除成功');
      }
    }).catch(() => {
      // 用户取消删除
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    
    // 模拟API调用成功
    notifications.value = notifications.value.filter(item => item.id !== id);
    totalNotifications.value--;
    
    ElMessage.success('删除成功');
  }
};

// 删除所有已读通知
const deleteAllRead = async () => {
  try {
    ElMessageBox.confirm('确定删除所有已读通知吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      // 调用API删除所有已读通知
      // 在实际项目中需要调用API
      // 这里模拟API调用
      const unreadCount = notifications.value.filter(item => !item.isRead).length;
      notifications.value = notifications.value.filter(item => !item.isRead);
      totalNotifications.value = unreadCount;
      
      ElMessage.success('已删除所有已读通知');
    });
  } catch (error) {
    console.error('删除已读通知失败:', error);
  }
};

// 跳转到链接
const goToLink = (link) => {
  router.push(link);
};

// 在对话框中跳转到链接并关闭对话框
const goToLinkAndClose = () => {
  if (currentNotification.link) {
    router.push(currentNotification.link);
    dialogVisible.value = false;
  }
};

// 处理页面大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadNotifications();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadNotifications();
};

// 监听筛选条件变化，重新加载数据
watch([filterType, filterStatus], () => {
  currentPage.value = 1; // 重置为第一页
  loadNotifications();
});

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.notification-page {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 8px;
}

.page-description {
  color: #666;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-label {
  margin-right: 10px;
  color: #666;
  white-space: nowrap;
}

.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.notification-list {
  margin-top: 20px;
}

.notification-card {
  margin-bottom: 10px;
  transition: background-color 0.3s;
}

.notification-card.unread {
  background-color: #f0f9ff;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-title h4 {
  margin: 0;
  font-size: 16px;
}

.notification-content {
  color: #333;
  margin-bottom: 10px;
}

.notification-footer {
  display: flex;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.notification-detail {
  padding: 10px;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notification-time {
  color: #999;
  font-size: 14px;
}

.notification-detail-content {
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-container {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-actions {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
  }
  
  .notification-header {
    flex-direction: column;
  }
  
  .notification-actions {
    margin-top: 10px;
  }
}
</style> 