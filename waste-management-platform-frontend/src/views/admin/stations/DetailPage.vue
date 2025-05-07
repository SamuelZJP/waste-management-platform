<template>
  <div class="station-detail-page">
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" icon="ArrowLeft">返回</el-button>
        <h1 v-if="station">{{ station.name }} 详情</h1>
        <h1 v-else>垃圾站详情</h1>
      </div>
      <div class="header-right">
        <el-button-group>
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
          <el-button type="success" @click="goToMap">
            <el-icon><Location /></el-icon> 在地图中查看
          </el-button>
          <el-button :type="station && station.status !== 'normal' ? 'warning' : 'info'" 
            @click="goToStatus" :disabled="!station || station.status === 'normal'">
            <el-icon><Warning /></el-icon> 处理异常
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton style="width: 100%" animated>
        <template #template>
          <el-skeleton-item variant="text" style="width: 50%" />
          <el-skeleton-item variant="text" style="margin-top: 16px; width: 80%" />
          <el-skeleton-item variant="text" style="margin-top: 16px; width: 70%" />
          <el-skeleton-item variant="h1" style="margin-top: 20px; width: 50%" />
          <el-skeleton-item variant="text" style="margin-top: 16px; width: 80%" />
          <el-skeleton-item variant="text" style="margin-top: 16px; width: 70%" />
        </template>
      </el-skeleton>
    </div>
    
    <!-- 垃圾站不存在提示 -->
    <el-empty v-else-if="!station" description="未找到该垃圾站信息">
      <el-button type="primary" @click="goBack">返回列表</el-button>
    </el-empty>
    
    <!-- 垃圾站详情内容 -->
    <template v-else>
      <!-- 状态概览卡片 -->
      <el-row :gutter="20" class="summary-section">
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="status-card" :class="`status-${station.status}`">
            <div class="status-header">
              <h3>运行状态</h3>
              <div class="status-tag">
                <el-tag :type="getStatusType(station.status)" effect="dark" size="large">
                  {{ getStatusText(station.status) }}
                </el-tag>
              </div>
            </div>
            <div class="status-info">
              <div v-if="station.status !== 'normal'" class="status-message">
                {{ station.statusMessage || '状态异常，需关注' }}
              </div>
              <div v-else class="status-message">
                所有设备运行正常
              </div>
              <div class="status-time">
                最后更新: {{ station.lastUpdate }}
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="card-info">
              <div class="info-title">今日回收总量</div>
              <div class="info-value">{{ station.todayVolume }} kg</div>
              <div class="info-footer">
                <span :class="station.volumeTrend > 0 ? 'trend-up' : 'trend-down'">
                  <el-icon v-if="station.volumeTrend > 0"><CaretTop /></el-icon>
                  <el-icon v-else><CaretBottom /></el-icon>
                  {{ Math.abs(station.volumeTrend) }}%
                </span>
                <span class="trend-text">同比昨日</span>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="8">
          <el-card shadow="hover" class="summary-card">
            <div class="card-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="card-info">
              <div class="info-title">今日用户数</div>
              <div class="info-value">{{ station.todayUsers || 0 }}</div>
              <div class="info-footer">
                <span :class="station.userTrend > 0 ? 'trend-up' : 'trend-down'">
                  <el-icon v-if="station.userTrend > 0"><CaretTop /></el-icon>
                  <el-icon v-else><CaretBottom /></el-icon>
                  {{ Math.abs(station.userTrend) }}%
                </span>
                <span class="trend-text">同比昨日</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 详细信息卡片 -->
      <el-row :gutter="20" class="detail-section">
        <el-col :xs="24" :sm="12">
          <el-card shadow="hover" class="detail-info-card">
            <template #header>
              <div class="card-header">
                <h3>基本信息</h3>
                <el-button type="primary" link @click="editStation">
                  编辑信息
                </el-button>
              </div>
            </template>
            
            <el-descriptions :column="1" border>
              <el-descriptions-item label="垃圾站编号">{{ station.id }}</el-descriptions-item>
              <el-descriptions-item label="垃圾站名称">{{ station.name }}</el-descriptions-item>
              <el-descriptions-item label="所在位置">{{ station.address }}</el-descriptions-item>
              <el-descriptions-item label="安装时间">{{ station.installTime }}</el-descriptions-item>
              <el-descriptions-item label="设备数量">{{ station.deviceCount }}</el-descriptions-item>
              <el-descriptions-item label="负责人">{{ station.manager }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ station.phone }}</el-descriptions-item>
              <el-descriptions-item label="最后维护">{{ station.lastMaintain }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12">
          <el-card shadow="hover" class="capacity-card">
            <template #header>
              <div class="card-header">
                <h3>容量状态</h3>
                <el-button type="success" link @click="arrangeCleanup" 
                  :disabled="!needsCleanup">
                  安排清运
                </el-button>
              </div>
            </template>
            
            <div class="capacity-section">
              <div class="capacity-item" v-for="(item, index) in station.capacity" :key="index">
                <div class="capacity-header">
                  <div class="capacity-name">{{ item.name }}</div>
                  <div class="capacity-value">
                    {{ item.value }}%
                    <el-tag 
                      v-if="item.value >= 90" 
                      type="danger" 
                      effect="light" 
                      size="small"
                    >
                      需清理
                    </el-tag>
                    <el-tag 
                      v-else-if="item.value >= 70" 
                      type="warning" 
                      effect="light" 
                      size="small"
                    >
                      即将满载
                    </el-tag>
                  </div>
                </div>
                <el-progress 
                  :percentage="item.value" 
                  :color="getCapacityColor(item.value)"
                  :status="getCapacityStatus(item.value)"
                  :stroke-width="12"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 设备列表卡片 -->
      <el-card shadow="hover" class="devices-section">
        <template #header>
          <div class="card-header">
            <h3>设备列表</h3>
            <div class="header-actions">
              <el-button type="primary" link @click="addDevice">添加设备</el-button>
            </div>
          </div>
        </template>
        
        <el-table
          :data="station.devices"
          style="width: 100%"
          :row-class-name="tableRowClassName"
        >
          <el-table-column label="设备ID" prop="id" width="100" />
          <el-table-column label="设备名称" prop="name" min-width="150" />
          <el-table-column label="设备类型" prop="type" width="120" />
          <el-table-column label="安装时间" prop="installTime" width="180" />
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="最后维护" prop="lastMaintain" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button 
                size="small"
                type="primary"
                link
                @click="viewDevice(scope.row)"
              >
                详情
              </el-button>
              <el-button 
                size="small"
                type="success"
                link
                @click="maintainDevice(scope.row)"
              >
                维护
              </el-button>
              <el-button 
                size="small"
                type="danger"
                link
                @click="replaceDevice(scope.row)"
              >
                更换
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <!-- 活动记录卡片 -->
      <el-row :gutter="20" class="activity-section">
        <el-col :xs="24" :sm="24" :md="12">
          <el-card shadow="hover" class="activity-card">
            <template #header>
              <div class="card-header">
                <h3>回收活动</h3>
                <el-button type="primary" link @click="viewAllRecords">
                  查看全部
                </el-button>
              </div>
            </template>
            
            <el-timeline>
              <el-timeline-item
                v-for="(activity, index) in station.activities"
                :key="index"
                :timestamp="activity.time"
                :type="activity.type"
              >
                <div class="activity-content">
                  <div class="activity-title">{{ activity.title }}</div>
                  <div class="activity-detail">{{ activity.content }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <h3>回收趋势</h3>
                <el-radio-group v-model="chartTimeRange" size="small">
                  <el-radio-button label="week">周</el-radio-button>
                  <el-radio-button label="month">月</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            
            <div class="chart-container">
              <!-- 实际项目中应使用ECharts等图表库 -->
              <img src="https://via.placeholder.com/600x300?text=回收趋势图表" alt="回收趋势图表" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Refresh, Location, Warning, ArrowLeft, 
  DataAnalysis, User, CaretTop, CaretBottom
} from '@element-plus/icons-vue';
import { getStationDetail } from '@/services/adminService';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const station = ref(null);
const chartTimeRange = ref('week');

// 判断是否需要清运
const needsCleanup = computed(() => {
  if (!station.value || !station.value.capacity) return false;
  return station.value.capacity.some(item => item.value >= 70);
});

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'normal': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    default: return 'info';
  }
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

// 获取容量状态
const getCapacityStatus = (value) => {
  if (value >= 90) return 'exception';
  if (value >= 70) return 'warning';
  return 'success';
};

// 获取容量颜色
const getCapacityColor = (value) => {
  if (value >= 90) return '#F56C6C';
  if (value >= 70) return '#E6A23C';
  return '#67C23A';
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 刷新数据
const refreshData = async () => {
  loading.value = true;
  await loadStationDetail();
  loading.value = false;
  ElMessage.success('数据已刷新');
};

// 前往地图页面
const goToMap = () => {
  router.push(`/admin/stations/map?stationId=${route.params.id}`);
};

// 前往状态监控页面
const goToStatus = () => {
  if (!station.value) return;
  router.push(`/admin/stations/status?stationId=${route.params.id}`);
};

// 编辑垃圾站信息
const editStation = () => {
  ElMessage.info('编辑垃圾站功能尚未实现');
  // 实际项目中应跳转到编辑页面或打开编辑对话框
};

// 安排清运
const arrangeCleanup = () => {
  ElMessageBox.confirm(
    `是否安排清运 ${station.value.name}?`,
    '安排清运',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`已安排清运 ${station.value.name}`);
    // 实际项目中应调用API创建清运任务
  }).catch(() => {});
};

// 添加设备
const addDevice = () => {
  ElMessage.info('添加设备功能尚未实现');
  // 实际项目中应跳转到添加设备页面或打开添加设备对话框
};

// 查看设备详情
const viewDevice = (device) => {
  ElMessage.info(`查看设备 ${device.name} 详情功能尚未实现`);
  // 实际项目中应跳转到设备详情页面或打开设备详情对话框
};

// 维护设备
const maintainDevice = (device) => {
  ElMessageBox.confirm(
    `是否为设备 ${device.name} 创建维护工单?`,
    '设备维护',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success(`已为设备 ${device.name} 创建维护工单`);
    // 实际项目中应调用API创建维护工单
  }).catch(() => {});
};

// 更换设备
const replaceDevice = (device) => {
  ElMessageBox.confirm(
    `是否为设备 ${device.name} 创建更换申请?`,
    '设备更换',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`已为设备 ${device.name} 创建更换申请`);
    // 实际项目中应调用API创建设备更换申请
  }).catch(() => {});
};

// 查看所有记录
const viewAllRecords = () => {
  router.push(`/admin/stations/${route.params.id}/records`);
};

// 表格行样式
const tableRowClassName = ({ row }) => {
  if (row.status === 'error') return 'row-error';
  if (row.status === 'warning') return 'row-warning';
  return '';
};

// 加载垃圾站详情
const loadStationDetail = async () => {
  const stationId = route.params.id;
  if (!stationId) {
    loading.value = false;
    return;
  }
  
  try {
    const res = await getStationDetail({ id: stationId });
    if (res.code === 200) {
      station.value = res.data;
      loading.value = false;
    } else {
      throw new Error(res.message || '获取垃圾站详情失败');
    }
  } catch (error) {
    console.error('获取垃圾站详情失败:', error);
    
    // 使用模拟数据
    mockStationData(stationId);
    loading.value = false;
    ElMessage.warning('使用模拟数据展示垃圾站详情');
  }
};

// 模拟垃圾站数据
const mockStationData = (id) => {
  const mockStation = {
    id: id,
    name: `${id}号楼垃圾站`,
    address: '小区东北角1号楼旁',
    status: 'normal',
    statusMessage: '',
    lastUpdate: '2023-05-15 10:30:45',
    installTime: '2022-08-15',
    deviceCount: 5,
    manager: '张工',
    phone: '13800138000',
    lastMaintain: '2023-04-20',
    todayVolume: 120.5,
    volumeTrend: 8.3,
    todayUsers: 34,
    userTrend: 12.5,
    capacity: [
      { name: '厨余垃圾', value: 65 },
      { name: '可回收物', value: 45 },
      { name: '有害垃圾', value: 30 },
      { name: '其他垃圾', value: 85 }
    ],
    devices: [
      { 
        id: 'DEV-001', 
        name: '压缩设备-A1', 
        type: '垃圾压缩机', 
        installTime: '2022-08-15', 
        status: 'normal',
        lastMaintain: '2023-04-20'
      },
      { 
        id: 'DEV-002', 
        name: '分类设备-B1', 
        type: '智能分类器', 
        installTime: '2022-08-15', 
        status: 'warning',
        lastMaintain: '2023-04-20'
      },
      { 
        id: 'DEV-003', 
        name: '监控设备-C1', 
        type: '监控摄像头', 
        installTime: '2022-08-15',

        status: 'normal',
        lastMaintain: '2023-04-20'
      },
      { 
        id: 'DEV-004', 
        name: '称重设备-D1', 
        type: '电子秤', 
        installTime: '2022-08-15', 
        status: 'error',
        lastMaintain: '2023-03-10'
      },
      { 
        id: 'DEV-005', 
        name: '环境监测-E1', 
        type: '空气质量检测仪', 
        installTime: '2022-08-15',
        status: 'normal',
        lastMaintain: '2023-04-20'
      }
    ],
    activities: [
      { 
        time: '2023-05-15 10:30', 
        type: 'success', 
        title: '居民投放回收',
        content: '3公斤厨余垃圾，2公斤可回收物'
      },
      { 
        time: '2023-05-15 09:45', 
        type: 'primary', 
        title: '系统自动称重',
        content: '厨余垃圾容器重量记录：65%'
      },
      { 
        time: '2023-05-15 08:20', 
        type: 'warning', 
        title: '设备状态预警',
        content: '称重设备-D1通信延迟'
      },
      { 
        time: '2023-05-15 07:30', 
        type: 'success', 
        title: '居民投放回收',
        content: '1.5公斤有害垃圾'
      },
      { 
        time: '2023-05-15 06:15', 
        type: 'success', 
        title: '环卫清运',
        content: '已清运其他垃圾'
      }
    ]
  };
  
  // 随机设置垃圾站状态
  const random = Math.random();
  if (random < 0.2) {
    mockStation.status = 'error';
    mockStation.statusMessage = '称重设备-D1故障，需维修';
  } else if (random < 0.4) {
    mockStation.status = 'warning';
    mockStation.statusMessage = '其他垃圾容量接近上限，建议安排清运';
  }
  
  station.value = mockStation;
};

onMounted(() => {
  loadStationDetail();
});
</script>

<style scoped>
.station-detail-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.summary-section,
.detail-section,
.activity-section {
  margin-bottom: 20px;
}

.status-card {
  height: 100%;
  margin-bottom: 20px;
}

.status-normal {
  border-left: 4px solid #67c23a;
}

.status-warning {
  border-left: 4px solid #e6a23c;
}

.status-error {
  border-left: 4px solid #f56c6c;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status-header h3 {
  margin: 0;
  font-size: 16px;
}

.status-message {
  font-size: 14px;
  margin-bottom: 10px;
}

.status-time {
  font-size: 12px;
  color: #909399;
}

.summary-card {
  display: flex;
  align-items: center;
  padding: 20px;
  height: 100%;
  margin-bottom: 20px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ecf5ff;
  color: #409eff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.card-icon i {
  font-size: 24px;
}

.card-info {
  flex: 1;
}

.info-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.info-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.info-footer {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
  display: flex;
  align-items: center;
  margin-right: 5px;
}

.trend-down {
  color: #f56c6c;
  display: flex;
  align-items: center;
  margin-right: 5px;
}

.trend-text {
  color: #909399;
}

.detail-info-card,
.capacity-card {
  height: 100%;
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

.capacity-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.capacity-item {
  margin-bottom: 5px;
}

.capacity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.capacity-name {
  font-size: 14px;
  color: #606266;
}

.capacity-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.devices-section {
  margin-bottom: 20px;
}

.activity-card,
.chart-card {
  height: 100%;
  margin-bottom: 20px;
}

.activity-content {
  padding: 0 5px;
}

.activity-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.activity-detail {
  font-size: 13px;
  color: #606266;
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

.row-error {
  background-color: #fef0f0 !important;
}

.row-warning {
  background-color: #fdf6ec !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .status-card,
  .summary-card {
    margin-bottom: 15px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 10px;
  }
}
</style> 