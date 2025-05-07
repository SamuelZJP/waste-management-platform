<template>
  <div class="stations-status-page">
    <div class="page-header">
      <h1>垃圾站状态监控</h1>
      <p class="page-description">实时监控辖区内智能垃圾站的设备运行状态和异常情况</p>
    </div>
    
    <el-row :gutter="20" class="filter-row">
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <el-select 
          v-model="selectedStationId" 
          placeholder="选择垃圾站" 
          clearable
          @change="handleStationChange"
          style="width: 100%"
        >
          <el-option 
            v-for="station in stations" 
            :key="station.id" 
            :label="station.name" 
            :value="station.id" 
          />
        </el-select>
      </el-col>
      
      <el-col :span="8" :xs="12" :sm="6" :md="8">
        <el-select 
          v-model="statusFilter" 
          placeholder="状态筛选" 
          clearable
          style="width: 100%"
        >
          <el-option label="全部" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="预警" value="warning" />
          <el-option label="故障" value="error" />
        </el-select>
      </el-col>
      
      <el-col :span="8" :xs="12" :sm="6" :md="8">
        <div class="action-buttons">
          <el-button type="primary" @click="refreshStatus">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
          <el-button type="success" @click="exportData">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </el-col>
    </el-row>
    
    <!-- 状态概览卡片 -->
    <el-row :gutter="20" class="status-overview">
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="status-card">
          <div class="status-icon normal">
            <el-icon><Check /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusCounts.normal }}</div>
            <div class="status-label">正常运行</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="status-card">
          <div class="status-icon warning">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusCounts.warning }}</div>
            <div class="status-label">预警状态</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="8">
        <el-card shadow="hover" class="status-card">
          <div class="status-icon error">
            <el-icon><CircleClose /></el-icon>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusCounts.error }}</div>
            <div class="status-label">故障离线</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 设备状态表格 -->
    <el-card shadow="hover" class="devices-card">
      <template #header>
        <div class="card-header">
          <h3>设备状态监控</h3>
          <div class="header-right">
            <span class="last-update">最后更新: {{ lastUpdateTime }}</span>
            <el-button link type="primary" @click="setAutoRefresh">
              {{ autoRefresh ? '停止自动刷新' : '开启自动刷新' }}
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table 
        :data="filteredDevices" 
        style="width: 100%"
        :empty-text="emptyText"
        v-loading="loading"
      >
        <el-table-column label="设备ID" prop="id" width="100" />
        <el-table-column label="设备名称" prop="name" min-width="150" />
        <el-table-column label="所属垃圾站" prop="stationName" min-width="150" />
        <el-table-column label="设备类型" prop="type" width="120" />
        <el-table-column label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="告警信息" prop="message" min-width="200" show-overflow-tooltip />
        <el-table-column label="更新时间" prop="updateTime" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              type="primary" 
              link
              @click="viewDeviceDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button 
              size="small" 
              type="warning" 
              link
              v-if="scope.row.status !== 'normal'"
              @click="handleDeviceIssue(scope.row)"
            >
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 实时监控图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>容量监控</h3>
              <el-select v-model="capacityChartStation" placeholder="选择垃圾站" style="width: 180px">
                <el-option label="所有垃圾站平均" value="all" />
                <el-option 
                  v-for="station in stations" 
                  :key="station.id" 
                  :label="station.name" 
                  :value="station.id" 
                />
              </el-select>
            </div>
          </template>
          <div class="chart-container capacity-chart">
            <!-- 实际项目中应使用ECharts等图表库 -->
            <img src="https://via.placeholder.com/600x300?text=容量监控图表" alt="容量监控图表" />
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>设备状态变化</h3>
              <el-select v-model="statusChartTime" placeholder="时间范围" style="width: 120px">
                <el-option label="今日" value="today" />
                <el-option label="本周" value="week" />
                <el-option label="本月" value="month" />
              </el-select>
            </div>
          </template>
          <div class="chart-container status-chart">
            <!-- 实际项目中应使用ECharts等图表库 -->
            <img src="https://via.placeholder.com/600x300?text=设备状态图表" alt="设备状态图表" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 设备详情对话框 -->
    <el-dialog
      v-model="deviceDialogVisible"
      title="设备详情"
      width="70%"
      destroy-on-close
    >
      <div v-if="selectedDevice" class="device-detail">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="设备ID">{{ selectedDevice.id }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ selectedDevice.name }}</el-descriptions-item>
          <el-descriptions-item label="所属垃圾站">{{ selectedDevice.stationName }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ selectedDevice.type }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedDevice.status)">
              {{ getStatusText(selectedDevice.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后更新">{{ selectedDevice.updateTime }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="device-section">
          <h4>状态详情</h4>
          <div v-if="selectedDevice.status !== 'normal'" class="device-alert">
            <el-alert
              :title="selectedDevice.message || '设备异常'"
              :type="selectedDevice.status === 'warning' ? 'warning' : 'error'"
              :description="selectedDevice.description"
              show-icon
            />
          </div>
          <div v-else class="device-normal">
            <el-alert
              title="设备运行正常"
              type="success"
              description="所有监控指标均在正常范围内"
              show-icon
            />
          </div>
        </div>
        
        <div class="device-section">
          <h4>运行数据</h4>
          <el-row :gutter="20" class="metrics-row">
            <!-- 模拟设备指标 -->
            <el-col :xs="12" :sm="8" :md="6" v-for="metric in deviceMetrics" :key="metric.name">
              <div class="metric-card">
                <div class="metric-name">{{ metric.name }}</div>
                <div class="metric-value" :class="{ 'warning': metric.isWarning }">
                  {{ metric.value }}{{ metric.unit }}
                </div>
                <div class="metric-range">正常范围: {{ metric.range }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="device-section">
          <h4>历史记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in deviceHistory"
              :key="index"
              :timestamp="activity.time"
              :type="getActivityType(activity.type)"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Refresh, Download, Check, Warning, 
  CircleClose, Connection, MoreFilled
} from '@element-plus/icons-vue';
import { getDeviceStatus } from '@/services/adminService';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const lastUpdateTime = ref('--');
const selectedStationId = ref('');
const statusFilter = ref('');
const deviceDialogVisible = ref(false);
const selectedDevice = ref(null);
const autoRefresh = ref(false);
const capacityChartStation = ref('all');
const statusChartTime = ref('today');

let autoRefreshTimer = null;

// 垃圾站数据
const stations = ref([
  { id: '1', name: '1号楼垃圾站' },
  { id: '2', name: '3号楼垃圾站' },
  { id: '3', name: '5号楼垃圾站' },
  { id: '4', name: '7号楼垃圾站' },
  { id: '5', name: '9号楼垃圾站' },
  { id: '6', name: '11号楼垃圾站' }
]);

// 设备数据
const devices = ref([]);

// 状态统计
const statusCounts = ref({
  normal: 0,
  warning: 0,
  error: 0
});

// 空状态文本
const emptyText = computed(() => {
  if (loading.value) return '加载中...';
  if (selectedStationId.value && statusFilter.value) {
    return `未找到 ${getStationName(selectedStationId.value)} 的 ${getStatusText(statusFilter.value)} 设备`;
  }
  if (selectedStationId.value) {
    return `${getStationName(selectedStationId.value)} 没有设备数据`;
  }
  if (statusFilter.value) {
    return `没有 ${getStatusText(statusFilter.value)} 的设备`;
  }
  return '暂无设备数据';
});

// 根据筛选条件过滤设备
const filteredDevices = computed(() => {
  let result = devices.value;
  
  if (selectedStationId.value) {
    result = result.filter(device => device.stationId === selectedStationId.value);
  }
  
  if (statusFilter.value) {
    result = result.filter(device => device.status === statusFilter.value);
  }
  
  return result;
});

// 获取垃圾站名称
const getStationName = (id) => {
  const station = stations.value.find(s => s.id === id);
  return station ? station.name : id;
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'normal': return '正常';
    case 'warning': return '预警';
    case 'error': return '故障';
    default: return '未知';
  }
};

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'normal': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    default: return 'info';
  }
};

// 获取活动类型
const getActivityType = (type) => {
  switch (type) {
    case 'normal': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    default: return 'primary';
  }
};

// 处理垃圾站选择变更
const handleStationChange = () => {
  refreshStatus();
};

// 刷新状态数据
const refreshStatus = async () => {
  loading.value = true;
  
  try {
    const res = await getDeviceStatus({ 
      stationId: selectedStationId.value || undefined
    });
    
    if (res.code === 200) {
      devices.value = res.data;
      updateStatusCounts();
      lastUpdateTime.value = new Date().toLocaleString();
    } else {
      throw new Error(res.message || '获取设备状态失败');
    }
  } catch (error) {
    console.error('获取设备状态失败:', error);
    
    // 使用模拟数据
    mockDeviceData();
    ElMessage.warning('使用模拟数据展示设备状态');
  } finally {
    loading.value = false;
  }
};

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出功能尚未实现');
  // 实际项目中应导出CSV或Excel文件
};

// 查看设备详情
const viewDeviceDetail = (device) => {
  selectedDevice.value = device;
  deviceDialogVisible.value = true;
  loadDeviceDetail(device.id);
};

// 处理设备异常
const handleDeviceIssue = (device) => {
  ElMessageBox.confirm(
    `是否创建工单处理设备 "${device.name}" 的异常?`,
    '创建维修工单',
    {
      confirmButtonText: '创建工单',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`已创建工单处理设备 "${device.name}" 的异常`);
    // 实际项目中应调用API创建工单
  }).catch(() => {});
};

// 设置自动刷新
const setAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  
  if (autoRefresh.value) {
    autoRefreshTimer = setInterval(() => {
      refreshStatus();
    }, 30000); // 每30秒刷新一次
    
    ElMessage.success('已开启自动刷新（每30秒）');
  } else {
    clearInterval(autoRefreshTimer);
    ElMessage.info('已停止自动刷新');
  }
};

// 更新状态统计
const updateStatusCounts = () => {
  statusCounts.value = {
    normal: devices.value.filter(d => d.status === 'normal').length,
    warning: devices.value.filter(d => d.status === 'warning').length,
    error: devices.value.filter(d => d.status === 'error').length
  };
};

// 加载设备详情
const loadDeviceDetail = (deviceId) => {
  // 实际项目中应调用API获取设备详情
  // 这里使用模拟数据
};

// 设备指标数据
const deviceMetrics = ref([
  { name: '温度', value: '36.5', unit: '°C', range: '0-50°C', isWarning: false },
  { name: '湿度', value: '65', unit: '%', range: '20-80%', isWarning: false },
  { name: '电压', value: '220', unit: 'V', range: '200-240V', isWarning: false },
  { name: '电流', value: '5.2', unit: 'A', range: '0-10A', isWarning: false },
  { name: '功率', value: '1150', unit: 'W', range: '0-2000W', isWarning: false },
  { name: '噪音', value: '62', unit: 'dB', range: '0-70dB', isWarning: false },
  { name: '压力', value: '85', unit: 'kPa', range: '70-100kPa', isWarning: true },
  { name: '运行时间', value: '246', unit: 'h', range: '-', isWarning: false }
]);

// 设备历史记录
const deviceHistory = ref([
  { time: '2023-05-15 10:30:45', type: 'normal', content: '设备正常运行' },
  { time: '2023-05-15 08:15:20', type: 'warning', content: '压力传感器数值超出正常范围' },
  { time: '2023-05-14 16:40:12', type: 'info', content: '完成例行维护检查' },
  { time: '2023-05-14 09:25:33', type: 'normal', content: '设备重启完成' },
  { time: '2023-05-13 14:50:27', type: 'error', content: '设备通信异常，自动重启' }
]);

// 模拟设备数据
const mockDeviceData = () => {
  const mockDevices = [];
  const deviceTypes = ['压缩设备', '分类设备', '监控设备', '称重设备', '环境监测'];
  const statuses = ['normal', 'normal', 'normal', 'warning', 'error'];
  const messages = {
    warning: [
      '温度过高',
      '容量接近上限',
      '通信延迟',
      '电压波动',
      '环境湿度过高'
    ],
    error: [
      '设备离线',
      '通信中断',
      '电机故障',
      '传感器损坏',
      '电源故障'
    ]
  };
  
  // 为每个垃圾站生成随机设备
  stations.value.forEach(station => {
    const deviceCount = 3 + Math.floor(Math.random() * 3); // 每个垃圾站3-5个设备
    
    for (let i = 0; i < deviceCount; i++) {
      const typeIndex = Math.floor(Math.random() * deviceTypes.length);
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const status = statuses[statusIndex];
      
      const device = {
        id: `DEV-${station.id}-${i + 1}`,
        stationId: station.id,
        stationName: station.name,
        name: `${deviceTypes[typeIndex]}-${station.id}${String.fromCharCode(65 + i)}`,
        type: deviceTypes[typeIndex],
        status: status,
        updateTime: new Date(Date.now() - Math.random() * 8640000).toLocaleString(), // 随机时间，最近24小时内
      };
      
      if (status === 'warning') {
        const msgIndex = Math.floor(Math.random() * messages.warning.length);
        device.message = messages.warning[msgIndex];
      } else if (status === 'error') {
        const msgIndex = Math.floor(Math.random() * messages.error.length);
        device.message = messages.error[msgIndex];
      }
      
      mockDevices.push(device);
    }
  });
  
  devices.value = mockDevices;
  updateStatusCounts();
  lastUpdateTime.value = new Date().toLocaleString();
};

onMounted(() => {
  // 从URL参数获取垃圾站ID
  if (route.query.stationId) {
    selectedStationId.value = route.query.stationId;
  }
  
  refreshStatus();
});

onUnmounted(() => {
  // 清除定时器
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
});
</script>

<style scoped>
.stations-status-page {
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

.filter-row {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  color: white;
}

.status-icon i {
  font-size: 28px;
}

.status-icon.normal {
  background-color: #67c23a;
}

.status-icon.warning {
  background-color: #e6a23c;
}

.status-icon.error {
  background-color: #f56c6c;
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

.devices-card {
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

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.last-update {
  font-size: 12px;
  color: #909399;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 设备详情样式 */
.device-detail {
  padding: 10px;
}

.device-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.device-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.device-alert {
  margin-bottom: 15px;
}

.metrics-row {
  margin-top: 15px;
}

.metric-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 15px;
  height: 100%;
}

.metric-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.metric-value.warning {
  color: #e6a23c;
}

.metric-range {
  font-size: 12px;
  color: #909399;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .action-buttons {
    justify-content: flex-start;
    margin-top: 10px;
  }
  
  .status-card {
    margin-bottom: 15px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style> 