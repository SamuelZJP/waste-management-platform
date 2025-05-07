<template>
  <div class="feedback-page">
    <div class="page-header">
      <h1>问题反馈管理</h1>
      <p class="page-description">管理用户提交的问题反馈和处理记录</p>
    </div>
    
    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="标题/内容" clearable />
        </el-form-item>
        
        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
            <el-option label="功能建议" value="suggestion" />
            <el-option label="故障报告" value="issue" />
            <el-option label="投诉" value="complaint" />
            <el-option label="咨询" value="question" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="未处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 反馈统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.unprocessed }}</div>
          <div class="stat-label">未处理反馈</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.processing }}</div>
          <div class="stat-label">处理中</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.today }}</div>
          <div class="stat-label">今日新增</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ stats.avgResponseTime }}</div>
          <div class="stat-label">平均响应时间(小时)</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 反馈列表 -->
    <el-card shadow="hover" class="feedback-card">
      <template #header>
        <div class="card-header">
          <h3>反馈列表</h3>
          <div class="header-actions">
            <el-button type="success" @click="batchProcess">
              <el-icon><Check /></el-icon> 批量处理
            </el-button>
            <el-button type="primary" @click="refreshList">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="feedbackList"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="反馈信息" min-width="250">
          <template #default="scope">
            <div class="feedback-title">{{ scope.row.title }}</div>
            <div class="feedback-desc">{{ scope.row.content }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="username" label="用户" min-width="120" />
        
        <el-table-column label="类型" width="100">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.type)" effect="plain">
              {{ getTypeLabel(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="提交时间" min-width="150" />
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              @click="viewDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status === 'pending'"
              @click="processFeedback(scope.row)"
            >
              受理
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status === 'processing'"
              @click="resolveFeedback(scope.row)"
            >
              解决
            </el-button>
            <el-button 
              type="danger" 
              link 
              v-if="scope.row.status !== 'closed'"
              @click="closeFeedback(scope.row)"
            >
              关闭
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 反馈详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="反馈详情"
      width="650px"
    >
      <div v-if="currentFeedback" class="feedback-detail">
        <el-descriptions border :column="1">
          <el-descriptions-item label="反馈标题">{{ currentFeedback.title }}</el-descriptions-item>
          <el-descriptions-item label="反馈内容">{{ currentFeedback.content }}</el-descriptions-item>
          <el-descriptions-item label="提交用户">{{ currentFeedback.username }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ currentFeedback.contact }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getTypeTag(currentFeedback.type)" effect="plain">
              {{ getTypeLabel(currentFeedback.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(currentFeedback.status)">
              {{ getStatusLabel(currentFeedback.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentFeedback.createTime }}</el-descriptions-item>
          <el-descriptions-item label="相关设备/站点" v-if="currentFeedback.relatedDevice">
            {{ currentFeedback.relatedDevice }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="feedback-images" v-if="currentFeedback.images && currentFeedback.images.length">
          <h4>附件图片</h4>
          <div class="image-list">
            <el-image 
              v-for="(image, index) in currentFeedback.images" 
              :key="index"
              :src="image" 
              :preview-src-list="currentFeedback.images"
              fit="cover"
              class="feedback-image"
            />
          </div>
        </div>
        
        <div class="feedback-reply" v-if="currentFeedback.replies && currentFeedback.replies.length">
          <h4>处理记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(reply, index) in currentFeedback.replies"
              :key="index"
              :timestamp="reply.time"
              :type="reply.type"
            >
              <div class="reply-content">
                <div class="reply-user">{{ reply.user }}</div>
                <div class="reply-text">{{ reply.content }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
        
        <div class="reply-form" v-if="currentFeedback.status !== 'closed'">
          <h4>添加回复</h4>
          <el-form>
            <el-form-item>
              <el-input 
                v-model="replyContent" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入回复内容..."
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitReply">发送回复</el-button>
              <el-button 
                type="success" 
                v-if="currentFeedback.status === 'pending'"
                @click="processFeedback(currentFeedback, true)"
              >
                受理
              </el-button>
              <el-button 
                type="success" 
                v-if="currentFeedback.status === 'processing'"
                @click="resolveFeedback(currentFeedback, true)"
              >
                解决
              </el-button>
              <el-button 
                type="danger" 
                @click="closeFeedback(currentFeedback, true)"
              >
                关闭
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Check, Refresh } from '@element-plus/icons-vue';
import { getFeedbackList, getFeedbackDetail } from '@/services/adminService';

// 状态与数据
const loading = ref(false);
const feedbackList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const detailVisible = ref(false);
const currentFeedback = ref(null);
const replyContent = ref('');
const selectedFeedbacks = ref([]);

// 统计数据
const stats = ref({
  unprocessed: 0,
  processing: 0,
  today: 0,
  avgResponseTime: 0
});

// 筛选表单
const filterForm = ref({
  keyword: '',
  type: '',
  status: ''
});

// 类型和状态标签
const getTypeLabel = (type) => {
  const map = {
    suggestion: '功能建议',
    issue: '故障报告',
    complaint: '投诉',
    question: '咨询'
  };
  return map[type] || '未知';
};

const getTypeTag = (type) => {
  const map = {
    suggestion: 'info',
    issue: 'danger',
    complaint: 'warning',
    question: 'success'
  };
  return map[type] || 'info';
};

const getStatusLabel = (status) => {
  const map = {
    pending: '未处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  };
  return map[status] || '未知';
};

const getStatusTag = (status) => {
  const map = {
    pending: 'danger',
    processing: 'warning',
    resolved: 'success',
    closed: 'info'
  };
  return map[status] || 'info';
};

// 加载反馈列表
const loadFeedbackList = async () => {
  loading.value = true;
  
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filterForm.value
    };
    
    const res = await getFeedbackList(params);
    if (res && res.code === 200) {
      feedbackList.value = res.data.list;
      total.value = res.data.total;
      stats.value = res.data.stats;
      loading.value = false;
    } else {
      throw new Error(res.message || '获取反馈列表失败');
    }
  } catch (error) {
    console.error('获取反馈列表失败:', error);
    loading.value = false;
  }
};

// 应用筛选
const applyFilter = () => {
  currentPage.value = 1;
  loadFeedbackList();
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    keyword: '',
    type: '',
    status: ''
  };
  applyFilter();
};

// 刷新列表
const refreshList = () => {
  loadFeedbackList();
  ElMessage.success('反馈列表已刷新');
};

// 查看详情
const viewDetail = async (feedback) => {
  try {
    // 从服务获取详细信息
    const res = await getFeedbackDetail(feedback.id);
    if (res && res.code === 200) {
      currentFeedback.value = res.data;
    } else {
      // 如果获取失败，则使用列表中的数据
      currentFeedback.value = feedback;
    }
  } catch (error) {
    console.error('获取反馈详情失败:', error);
    // 使用列表中的数据作为备用
    currentFeedback.value = feedback;
  }
  
  replyContent.value = '';
  detailVisible.value = true;
};

// 处理反馈
const processFeedback = (feedback, isInDialog = false) => {
  ElMessageBox.confirm(
    `确定受理该反馈吗？`,
    '受理反馈',
    { type: 'warning' }
  )
    .then(() => {
      feedback.status = 'processing';
      
      if (replyContent.value && isInDialog) {
        addReply('processing');
      } else {
        ElMessage.success('反馈已受理');
      }
    })
    .catch(() => {});
};

// 解决反馈
const resolveFeedback = (feedback, isInDialog = false) => {
  ElMessageBox.confirm(
    `确定将该反馈标记为已解决吗？`,
    '解决反馈',
    { type: 'warning' }
  )
    .then(() => {
      feedback.status = 'resolved';
      
      if (replyContent.value && isInDialog) {
        addReply('resolved');
      } else {
        ElMessage.success('反馈已标记为已解决');
      }
    })
    .catch(() => {});
};

// 关闭反馈
const closeFeedback = (feedback, isInDialog = false) => {
  ElMessageBox.confirm(
    `确定关闭该反馈吗？`,
    '关闭反馈',
    { type: 'danger' }
  )
    .then(() => {
      feedback.status = 'closed';
      
      if (replyContent.value && isInDialog) {
        addReply('closed');
      } else {
        ElMessage.success('反馈已关闭');
      }
    })
    .catch(() => {});
};

// 提交回复
const submitReply = () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空');
    return;
  }
  
  addReply('primary');
};

// 添加回复
const addReply = (type) => {
  if (!currentFeedback.value.replies) {
    currentFeedback.value.replies = [];
  }
  
  currentFeedback.value.replies.push({
    user: '管理员',
    content: replyContent.value,
    time: new Date().toLocaleString(),
    type: type
  });
  
  ElMessage.success('回复已添加');
  replyContent.value = '';
};

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedFeedbacks.value = selection;
};

// 批量处理
const batchProcess = () => {
  if (selectedFeedbacks.value.length === 0) {
    ElMessage.warning('请先选择要处理的反馈');
    return;
  }
  
  ElMessageBox.confirm(
    `确定批量处理选中的 ${selectedFeedbacks.value.length} 条反馈吗？`,
    '批量处理',
    { type: 'warning' }
  )
    .then(() => {
      // 实际应用中应调用API
      selectedFeedbacks.value.forEach(feedback => {
        if (feedback.status === 'pending') {
          feedback.status = 'processing';
        }
      });
      
      ElMessage.success(`已批量处理 ${selectedFeedbacks.value.length} 条反馈`);
    })
    .catch(() => {});
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadFeedbackList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadFeedbackList();
};

// 初始化
onMounted(() => {
  loadFeedbackList();
});
</script>

<style scoped>
.feedback-page {
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

.stat-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 15px;
  margin-bottom: 20px;
  height: 100%;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.feedback-card {
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

.feedback-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.feedback-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.feedback-detail {
  padding: 10px;
}

.feedback-images {
  margin-top: 20px;
}

.feedback-images h4, .feedback-reply h4, .reply-form h4 {
  font-size: 16px;
  margin: 15px 0 10px 0;
  color: #606266;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feedback-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
}

.feedback-reply {
  margin-top: 20px;
}

.reply-content {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.reply-user {
  font-weight: bold;
  margin-bottom: 5px;
}

.reply-form {
  margin-top: 20px;
}

/* 响应式调整 */
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
  
  .feedback-image {
    width: 100px;
    height: 100px;
  }
}
</style> 