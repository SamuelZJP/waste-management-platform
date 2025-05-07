<template>
  <div class="station-issues-page">
    <div class="page-header">
      <h1>垃圾站异常处理</h1>
      <p class="page-description">处理和跟踪垃圾站设备异常和故障工单</p>
    </div>
    
    <!-- 筛选和操作 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="垃圾站">
          <el-select v-model="filterForm.stationId" placeholder="选择垃圾站">
            <el-option label="全部垃圾站" value="" />
            <el-option 
              v-for="station in stations" 
              :key="station.id" 
              :label="station.name" 
              :value="station.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="选择状态">
            <el-option label="全部状态" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select v-model="filterForm.priority" placeholder="选择优先级">
            <el-option label="全部优先级" value="" />
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 异常统计 -->
    <el-row :gutter="20" class="status-overview">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-icon pending">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusSummary.pending }}</div>
            <div class="status-label">待处理</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-icon processing">
            <el-icon><Loading /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusSummary.processing }}</div>
            <div class="status-label">处理中</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-icon resolved">
            <el-icon><Check /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusSummary.resolved }}</div>
            <div class="status-label">已解决</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-icon all">
            <el-icon><Document /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusSummary.total }}</div>
            <div class="status-label">全部工单</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 工单列表 -->
    <el-card shadow="hover" class="issues-card">
      <template #header>
        <div class="card-header">
          <h3>异常工单列表</h3>
          <div class="header-actions">
            <el-button type="success" @click="createIssue">
              <el-icon><Plus /></el-icon> 新建工单
            </el-button>
            <el-button @click="refreshList">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="filteredIssues" 
        style="width: 100%"
        v-loading="loading"
        :row-class-name="tableRowClassName"
      >
        <el-table-column prop="id" label="工单编号" width="120" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="垃圾站" min-width="150">
          <template #default="scope">
            {{ getStationName(scope.row.stationId) }}
          </template>
        </el-table-column>
        <el-table-column prop="deviceName" label="设备" min-width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" effect="plain">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="assignee" label="负责人" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              link
              @click="viewDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              link
              v-if="scope.row.status === 'pending'"
              @click="handleIssue(scope.row)"
            >
              处理
            </el-button>
            <el-button 
              size="small" 
              type="info" 
              link
              v-if="scope.row.status === 'processing'"
              @click="resolveIssue(scope.row)"
            >
              解决
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              link
              @click="closeIssue(scope.row)"
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
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalIssues"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Timer, Loading, Check, Document, 
  Plus, Refresh, Edit, MoreFilled
} from '@element-plus/icons-vue';
import { getIssuesList } from '@/services/adminService';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const issues = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalIssues = ref(0);

// 筛选表单
const filterForm = ref({
  stationId: '',
  status: '',
  priority: ''
});

// 垃圾站列表
const stations = ref([
  { id: '1', name: '1号楼垃圾站' },
  { id: '2', name: '3号楼垃圾站' },
  { id: '3', name: '5号楼垃圾站' },
  { id: '4', name: '7号楼垃圾站' },
  { id: '5', name: '9号楼垃圾站' },
  { id: '6', name: '11号楼垃圾站' }
]);

// 状态统计
const statusSummary = ref({
  pending: 0,
  processing: 0,
  resolved: 0,
  closed: 0,
  total: 0
});

// 过滤后的工单
const filteredIssues = computed(() => {
  return issues.value;
});

// 应用筛选
const applyFilter = () => {
  currentPage.value = 1;
  loadIssues();
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    stationId: '',
    status: '',
    priority: ''
  };
  applyFilter();
};

// 获取垃圾站名称
const getStationName = (id) => {
  const station = stations.value.find(s => s.id === id);
  return station ? station.name : id;
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待处理';
    case 'processing': return '处理中';
    case 'resolved': return '已解决';
    case 'closed': return '已关闭';
    default: return '未知';
  }
};

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'resolved': return 'success';
    case 'closed': return '';
    default: return 'info';
  }
};

// 获取优先级文本
const getPriorityText = (priority) => {
  switch (priority) {
    case 'low': return '低';
    case 'medium': return '中';
    case 'high': return '高';
    case 'urgent': return '紧急';
    default: return '未知';
  }
};

// 获取优先级类型
const getPriorityType = (priority) => {
  switch (priority) {
    case 'low': return 'info';
    case 'medium': return 'success';
    case 'high': return 'warning';
    case 'urgent': return 'danger';
    default: return 'info';
  }
};

// 表格行样式
const tableRowClassName = ({ row }) => {
  if (row.priority === 'urgent') return 'row-urgent';
  if (row.priority === 'high') return 'row-high';
  return '';
};

// 新建工单
const createIssue = () => {
  router.push('/admin/stations/issues/create');
};

// 查看工单详情
const viewDetail = (issue) => {
  router.push(`/admin/stations/issues/${issue.id}`);
};

// 处理工单
const handleIssue = (issue) => {
  ElMessageBox.prompt(
    '请输入处理备注:',
    '开始处理工单',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPlaceholder: '请简要描述处理计划'
    }
  )
    .then(({ value }) => {
      if (!value) {
        ElMessage.warning('请输入处理备注');
        return;
      }
      
      ElMessage.success(`工单 ${issue.id} 已开始处理`);
      // 实际项目中应调用API更新工单状态
      
      // 模拟更新状态
      issue.status = 'processing';
      updateStatusSummary();
    })
    .catch(() => {});
};

// 解决工单
const resolveIssue = (issue) => {
  ElMessageBox.prompt(
    '请输入解决方案:',
    '解决工单',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPlaceholder: '请描述问题解决方案'
    }
  )
    .then(({ value }) => {
      if (!value) {
        ElMessage.warning('请输入解决方案');
        return;
      }
      
      ElMessage.success(`工单 ${issue.id} 已解决`);
      // 实际项目中应调用API更新工单状态
      
      // 模拟更新状态
      issue.status = 'resolved';
      updateStatusSummary();
    })
    .catch(() => {});
};

// 关闭工单
const closeIssue = (issue) => {
  ElMessageBox.confirm(
    `确定要关闭工单 ${issue.id} 吗?`,
    '关闭工单',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      ElMessage.success(`工单 ${issue.id} 已关闭`);
      // 实际项目中应调用API更新工单状态
      
      // 模拟更新状态
      issue.status = 'closed';
      updateStatusSummary();
    })
    .catch(() => {});
};

// 刷新列表
const refreshList = () => {
  loadIssues();
  ElMessage.success('工单列表已刷新');
};

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadIssues();
};

// 每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadIssues();
};

// 更新状态统计
const updateStatusSummary = () => {
  statusSummary.value = {
    pending: issues.value.filter(i => i.status === 'pending').length,
    processing: issues.value.filter(i => i.status === 'processing').length,
    resolved: issues.value.filter(i => i.status === 'resolved').length,
    closed: issues.value.filter(i => i.status === 'closed').length,
    total: issues.value.length
  };
};

// 加载工单列表
const loadIssues = async () => {
  loading.value = true;
  
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filterForm.value
    };
    
    const res = await getIssuesList(params);
    if (res.code === 200) {
      issues.value = res.data.list;
      totalIssues.value = res.data.total;
      updateStatusSummary();
    } else {
      throw new Error(res.message || '获取工单列表失败');
    }
  } catch (error) {
    console.error('获取工单列表失败:', error);
    
    // 使用模拟数据
    mockIssuesData();
    ElMessage.warning('使用模拟数据展示工单列表');
  } finally {
    loading.value = false;
  }
};

// 模拟工单数据
const mockIssuesData = () => {
  const statusOptions = ['pending', 'processing', 'resolved', 'closed'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  const titlePrefix = [
    '垃圾压缩机故障', '分类器传感器异常', '称重设备无法连接',
    '摄像头离线', '环境监测设备数据异常', '电源故障',
    '通信中断', '软件系统错误', '容量预警'
  ];
  
  const mockIssues = [];
  
  // 生成15个模拟工单
  for (let i = 0; i < 15; i++) {
    const stationIndex = Math.floor(Math.random() * stations.value.length);
    const statusIndex = Math.floor(Math.random() * statusOptions.length);
    const priorityIndex = Math.floor(Math.random() * priorityOptions.length);
    const titleIndex = Math.floor(Math.random() * titlePrefix.length);
    
    const issue = {
      id: `ISSUE-${1000 + i}`,
      title: `${titlePrefix[titleIndex]} - ${stations.value[stationIndex].name}`,
      stationId: stations.value[stationIndex].id,
      deviceName: `设备-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      status: statusOptions[statusIndex],
      priority: priorityOptions[priorityIndex],
      createTime: new Date(Date.now() - Math.random() * 864000000).toLocaleString(), // 随机时间，最近10天内
      assignee: ['张工', '李工', '王工', '赵工'][Math.floor(Math.random() * 4)]
    };
    
    mockIssues.push(issue);
  }
  
  // 检查URL参数中是否有指定的垃圾站
  if (route.query.stationId) {
    const stationId = route.query.stationId;
    filterForm.value.stationId = stationId;
    
    // 确保有该垃圾站的工单
    if (!mockIssues.some(i => i.stationId === stationId)) {
      const station = stations.value.find(s => s.id === stationId);
      if (station) {
        mockIssues.push({
          id: `ISSUE-${1015}`,
          title: `自动生成的预警工单 - ${station.name}`,
          stationId: stationId,
          deviceName: '自动检测系统',
          status: 'pending',
          priority: 'high',
          createTime: new Date().toLocaleString(),
          assignee: '系统'
        });
      }
    }
  }
  
  issues.value = mockIssues;
  totalIssues.value = mockIssues.length;
  updateStatusSummary();
};

onMounted(() => {
  // 检查URL参数
  if (route.query.stationId) {
    filterForm.value.stationId = route.query.stationId;
  }
  
  loadIssues();
});
</script>

<style scoped>
.station-issues-page {
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

.status-overview {
  margin-bottom: 20px;
}

.status-card {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 20px;
}

.status-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  color: white;
}

.status-icon.pending {
  background-color: #e6a23c;
}

.status-icon.processing {
  background-color: #409eff;
}

.status-icon.resolved {
  background-color: #67c23a;
}

.status-icon.all {
  background-color: #909399;
}

.status-info {
  flex: 1;
}

.status-count {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.status-label {
  font-size: 14px;
  color: #666;
}

.issues-card {
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

.row-urgent {
  background-color: #fef0f0 !important;
}

.row-high {
  background-color: #fdf6ec !important;
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
  }
  
  .status-card {
    margin-bottom: 15px;
  }
}
</style> 