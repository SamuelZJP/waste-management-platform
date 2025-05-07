<template>
  <div class="tasks-page">
    <div class="page-header">
      <h1>任务管理</h1>
      <p class="page-description">管理系统内的任务分配和执行情况</p>
    </div>
    
    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="任务名称/内容" clearable />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="processing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select v-model="filterForm.priority" placeholder="全部优先级" clearable>
            <el-option label="紧急" value="high" />
            <el-option label="普通" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 任务统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ taskStats.total }}</div>
          <div class="stat-label">总任务数</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ taskStats.processing }}</div>
          <div class="stat-label">进行中</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ taskStats.todayDue }}</div>
          <div class="stat-label">今日到期</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ taskStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 任务列表 -->
    <el-card shadow="hover" class="tasks-card">
      <template #header>
        <div class="card-header">
          <h3>任务列表</h3>
          <div class="header-actions">
            <el-button type="success" @click="createTask">
              <el-icon><Plus /></el-icon> 新建任务
            </el-button>
            <el-button type="primary" @click="refreshTasks">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="tasks"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column label="任务信息" min-width="250">
          <template #default="scope">
            <div class="task-title">{{ scope.row.title }}</div>
            <div class="task-desc">{{ scope.row.description }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="assignee" label="负责人" min-width="120" />
        
        <el-table-column label="优先级" width="100">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" effect="plain">
              {{ getPriorityLabel(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="dueDate" label="截止日期" min-width="150" />
        
        <el-table-column label="进度" min-width="180">
          <template #default="scope">
            <el-progress 
              :percentage="scope.row.progress" 
              :status="scope.row.progress === 100 ? 'success' : ''"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              @click="viewTask(scope.row)"
            >
              详情
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status !== 'completed' && scope.row.status !== 'cancelled'"
              @click="updateTaskStatus(scope.row, 'completed')"
            >
              完成
            </el-button>
            <el-button 
              type="warning" 
              link 
              @click="editTask(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="deleteTask(scope.row)"
            >
              删除
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
    
    <!-- 任务详情对话框 -->
    <el-dialog
      v-model="taskDetailVisible"
      title="任务详情"
      width="600px"
    >
      <div v-if="currentTask" class="task-detail">
        <el-descriptions border :column="1">
          <el-descriptions-item label="任务标题">{{ currentTask.title }}</el-descriptions-item>
          <el-descriptions-item label="任务描述">{{ currentTask.description }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentTask.assignee }}</el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityType(currentTask.priority)" effect="plain">
              {{ getPriorityLabel(currentTask.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTask.status)">
              {{ getStatusLabel(currentTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentTask.createTime }}</el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ currentTask.dueDate }}</el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress 
              :percentage="currentTask.progress" 
              :status="currentTask.progress === 100 ? 'success' : ''"
            />
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh } from '@element-plus/icons-vue';
import { getTasksList } from '@/services/adminService';

// 状态与数据
const loading = ref(false);
const tasks = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const taskDetailVisible = ref(false);
const currentTask = ref(null);

// 筛选表单
const filterForm = ref({
  keyword: '',
  status: '',
  priority: ''
});

// 任务统计数据
const taskStats = ref({
  total: 0,
  processing: 0,
  todayDue: 0,
  completed: 0
});

// 获取优先级标签和样式
const getPriorityLabel = (priority) => {
  const map = {
    high: '紧急',
    medium: '普通',
    low: '低'
  };
  return map[priority] || '未知';
};

const getPriorityType = (priority) => {
  const map = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  };
  return map[priority] || 'info';
};

// 获取状态标签和样式
const getStatusLabel = (status) => {
  const map = {
    pending: '未开始',
    processing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status] || '未知';
};

const getStatusType = (status) => {
  const map = {
    pending: 'info',
    processing: 'warning',
    completed: 'success',
    cancelled: 'danger'
  };
  return map[status] || 'info';
};

// 加载任务列表
const loadTasks = async () => {
  loading.value = true;
  
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filterForm.value
    };
    
    const res = await getTasksList(params);
    if (res && res.code === 200) {
      tasks.value = res.data.list;
      total.value = res.data.total;
      taskStats.value = res.data.stats;
      loading.value = false;
    } else {
      throw new Error(res.message || '获取任务列表失败');
    }
  } catch (error) {
    console.error('获取任务列表失败:', error);
    loading.value = false;
  }
};

// 应用筛选
const applyFilter = () => {
  currentPage.value = 1;
  loadTasks();
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    keyword: '',
    status: '',
    priority: ''
  };
  applyFilter();
};

// 刷新任务列表
const refreshTasks = () => {
  loadTasks();
  ElMessage.success('任务列表已刷新');
};

// 创建任务
const createTask = () => {
  ElMessage.info('新建任务功能');
};

// 查看任务详情
const viewTask = (task) => {
  currentTask.value = task;
  taskDetailVisible.value = true;
};

// 编辑任务
const editTask = (task) => {
  ElMessage.info(`编辑任务: ${task.title}`);
};

// 更新任务状态
const updateTaskStatus = (task, status) => {
  ElMessageBox.confirm(
    `确定将任务"${task.title}"标记为${getStatusLabel(status)}吗？`,
    '更新任务状态',
    { type: 'warning' }
  )
    .then(() => {
      task.status = status;
      if (status === 'completed') {
        task.progress = 100;
      }
      ElMessage.success(`任务已标记为${getStatusLabel(status)}`);
    })
    .catch(() => {});
};

// 删除任务
const deleteTask = (task) => {
  ElMessageBox.confirm(
    `确定删除任务"${task.title}"吗？`,
    '删除任务',
    { type: 'danger' }
  )
    .then(() => {
      tasks.value = tasks.value.filter(t => t.id !== task.id);
      total.value = tasks.value.length;
      ElMessage.success('任务已删除');
    })
    .catch(() => {});
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadTasks();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadTasks();
};

// 初始化
onMounted(() => {
  loadTasks();
});
</script>

<style scoped>
.tasks-page {
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

.tasks-card {
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

.task-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.task-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.task-detail {
  padding: 10px;
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
}
</style> 