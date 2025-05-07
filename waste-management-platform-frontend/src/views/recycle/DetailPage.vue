<template>
  <div class="detail-page">
    <el-row :gutter="20">
      <!-- 基本信息卡片 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="detail-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <h2 class="point-name">{{ recyclePoint.name }}</h2>
              <div 
                class="point-status" 
                :class="{
                  'status-online': recyclePoint.status === 1,
                  'status-offline': recyclePoint.status === 0,
                  'status-fault': recyclePoint.status === 2
                }"
              >
                {{ getStatusText(recyclePoint.status) }}
              </div>
            </div>
          </template>
          
          <div class="point-image-container">
            <img :src="recyclePoint.imageUrl" alt="回收站图片" class="point-image" />
          </div>
          
          <div class="point-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="地址">
                <div class="info-with-icon">
                  <el-icon><Location /></el-icon>
                  <span>{{ recyclePoint.address }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="开放时间">
                <div class="info-with-icon">
                  <el-icon><Clock /></el-icon>
                  <span>{{ recyclePoint.openingHours }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="联系方式">
                <div class="info-with-icon">
                  <el-icon><Phone /></el-icon>
                  <span>{{ recyclePoint.contact }}</span>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="接收垃圾类型">
                <el-tag 
                  v-for="type in recyclePoint.wasteTypes" 
                  :key="type" 
                  :type="getTagType(type)" 
                  class="waste-type-tag"
                >
                  {{ type }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="距离">
                <div class="info-with-icon">
                  <el-icon><Position /></el-icon>
                  <span>{{ recyclePoint.distance }}米</span>
                </div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
      
      <!-- 容量信息卡片 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-card class="detail-card capacity-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <h3>容量信息</h3>
              <div class="update-time">更新时间: {{ recyclePoint.lastUpdated || '未知' }}</div>
            </div>
          </template>
          
          <div class="capacity-overview">
            <h4>总体容量</h4>
            <el-progress type="dashboard" :percentage="recyclePoint.capacity || 0" :color="getCapacityColor(recyclePoint.capacity)" />
          </div>
          
          <div class="capacity-details">
            <h4>分类容量</h4>
            <div class="category-capacity" v-for="(item, index) in recyclePoint.wasteCapacity" :key="index">
              <div class="category-header">
                <span>{{ item.type }}</span>
                <span>{{ item.capacity }}%</span>
              </div>
              <el-progress :percentage="item.capacity" :color="getCapacityColor(item.capacity)" />
            </div>
            
            <el-empty v-if="!recyclePoint.wasteCapacity || recyclePoint.wasteCapacity.length === 0" description="暂无容量信息" />
          </div>
        </el-card>
        
        <!-- 操作记录卡片 -->
        <el-card class="detail-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <h3>操作记录</h3>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="log in recyclePoint.operationLogs"
              :key="log.id"
              :timestamp="log.operationTime"
              placement="top"
            >
              <div class="log-item">
                <span class="log-content">{{ log.operation }}</span>
                <span class="log-operator">操作人: {{ log.operator }}</span>
              </div>
            </el-timeline-item>
            
            <el-empty v-if="!recyclePoint.operationLogs || recyclePoint.operationLogs.length === 0" description="暂无操作记录" />
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 用户反馈卡片 -->
    <el-row :gutter="20" class="feedback-row">
      <el-col :span="24">
        <el-card class="detail-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <h3>用户反馈</h3>
              <el-button type="primary" size="small" @click="showFeedbackDialog = true">提交反馈</el-button>
            </div>
          </template>
          
          <div class="feedback-list">
            <el-empty v-if="!recyclePoint.feedbacks || recyclePoint.feedbacks.length === 0" description="暂无用户反馈" />
            
            <div v-else class="feedback-items">
              <div class="feedback-item" v-for="feedback in recyclePoint.feedbacks" :key="feedback.id">
                <div class="feedback-header">
                  <el-rate v-model="feedback.rating" disabled />
                  <span class="feedback-time">{{ feedback.createTime }}</span>
                </div>
                <div class="feedback-content">{{ feedback.content }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 反馈提交对话框 -->
    <el-dialog
      v-model="showFeedbackDialog"
      title="提交反馈"
      width="500px"
    >
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="评分">
          <el-rate v-model="feedbackForm.rating" />
        </el-form-item>
        <el-form-item label="反馈内容">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您对该回收站的反馈意见..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showFeedbackDialog = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback" :loading="submitting">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Location, Clock, Phone, Position } from '@element-plus/icons-vue';
import { getRecyclePointDetail, submitRecyclePointFeedback } from '@/services/recycleService';

const route = useRoute();
const loading = ref(true);
const submitting = ref(false);
const showFeedbackDialog = ref(false);
const feedbackForm = ref({
  rating: 5,
  content: ''
});

// 默认回收点数据
const recyclePoint = ref({
  id: 0,
  name: '',
  address: '',
  longitude: 0,
  latitude: 0,
  openingHours: '',
  wasteTypes: [],
  contact: '',
  imageUrl: '',
  distance: 0,
  capacity: 0,
  status: 1,
  lastUpdated: '',
  wasteCapacity: [],
  feedbacks: [],
  operationLogs: []
});

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '离线';
    case 1: return '在线';
    case 2: return '故障';
    default: return '未知';
  }
};

// 获取容量颜色
const getCapacityColor = (capacity) => {
  if (!capacity) return '#909399';
  if (capacity < 50) return '#67c23a';
  if (capacity < 80) return '#e6a23c';
  return '#f56c6c';
};

// 获取垃圾类型标签样式
const getTagType = (type) => {
  switch (type) {
    case '可回收物': return 'primary';
    case '厨余垃圾': return 'success';
    case '有害垃圾': return 'danger';
    case '其他垃圾': return '';
    default: return 'info';
  }
};

// 获取回收点详情
const getPointDetail = async () => {
  loading.value = true;
  const id = Number(route.params.id);
  
  try {
    const res = await getRecyclePointDetail(id);
    if (res.code === 200) {
      recyclePoint.value = res.data;
    } else {
      ElMessage.error(res.message || '获取回收点信息失败');
    }
  } catch (error) {
    console.error('获取回收点信息失败:', error);
    ElMessage.error('获取回收点信息失败');
  } finally {
    loading.value = false;
  }
};

// 提交反馈
const submitFeedback = async () => {
  if (!feedbackForm.value.content.trim()) {
    ElMessage.warning('请输入反馈内容');
    return;
  }
  
  submitting.value = true;
  
  try {
    const res = await submitRecyclePointFeedback({
      recyclePointId: recyclePoint.value.id,
      content: feedbackForm.value.content,
      rating: feedbackForm.value.rating
    });
    
    if (res.code === 200) {
      ElMessage.success('反馈提交成功');
      showFeedbackDialog.value = false;
      
      // 添加新提交的反馈到列表
      recyclePoint.value.feedbacks = [
        {
          id: res.data.id,
          content: feedbackForm.value.content,
          rating: feedbackForm.value.rating,
          createTime: res.data.createTime
        },
        ...(recyclePoint.value.feedbacks || [])
      ];
      
      // 重置表单
      feedbackForm.value.content = '';
      feedbackForm.value.rating = 5;
    } else {
      ElMessage.error(res.message || '提交反馈失败');
    }
  } catch (error) {
    console.error('提交反馈失败:', error);
    ElMessage.error('提交反馈失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  getPointDetail();
});
</script>

<style scoped>
.detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.point-name {
  margin: 0;
  font-size: 20px;
}

.point-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  color: white;
}

.status-online {
  background-color: #67c23a;
}

.status-offline {
  background-color: #909399;
}

.status-fault {
  background-color: #f56c6c;
}

.point-image-container {
  margin-bottom: 20px;
}

.point-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 4px;
}

.info-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.waste-type-tag {
  margin-right: 10px;
  margin-bottom: 5px;
}

.update-time {
  font-size: 14px;
  color: #909399;
}

.capacity-overview {
  text-align: center;
  margin-bottom: 20px;
}

.capacity-overview h4 {
  margin-bottom: 15px;
}

.capacity-details h4 {
  margin-bottom: 15px;
}

.category-capacity {
  margin-bottom: 15px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.feedback-row {
  margin-top: 10px;
}

.feedback-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.feedback-item {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  padding: 15px;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.feedback-time {
  font-size: 14px;
  color: #909399;
}

.feedback-content {
  color: #606266;
  line-height: 1.6;
}

.log-item {
  display: flex;
  flex-direction: column;
}

.log-content {
  font-weight: bold;
  margin-bottom: 5px;
}

.log-operator {
  font-size: 14px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-items {
    grid-template-columns: 1fr;
  }
  
  .point-image {
    height: 200px;
  }
}
</style> 