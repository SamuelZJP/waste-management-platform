<template>
  <div class="station-map-page">
    <div class="page-header">
      <h1>垃圾站地图分布</h1>
      <p class="page-description">查看和管理社区内智能垃圾站的地理位置分布</p>
    </div>
    
    <el-card class="map-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h3>垃圾站分布图</h3>
            <el-tag type="info">共 {{ stations.length }} 个垃圾站</el-tag>
          </div>
          <div class="header-right">
            <el-radio-group v-model="mapMode" size="small">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="normal">正常</el-radio-button>
              <el-radio-button label="warning">预警</el-radio-button>
              <el-radio-button label="error">故障</el-radio-button>
            </el-radio-group>
            <el-button type="primary" size="small" @click="refreshMap">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <div class="map-container">
        <!-- 地图容器，实际项目中应集成高德地图或百度地图等 -->
        <div class="mock-map">
          <img src="https://via.placeholder.com/1200x500?text=垃圾站分布地图" alt="垃圾站分布地图" />
          
          <!-- 模拟地图上的标记点 -->
          <div 
            v-for="station in filteredStations" 
            :key="station.id"
            class="map-marker"
            :class="getMarkerClass(station.status)"
            :style="{
              left: `${station.position.x}%`,
              top: `${station.position.y}%`
            }"
            @click="selectStation(station)"
          >
            <el-tooltip 
              :content="`${station.name} (${getStatusText(station.status)})`"
              placement="top"
              :visible="selectedStationId === station.id"
            >
              <el-icon><Location /></el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-row :gutter="20" class="station-info-section">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="station-list-card">
          <template #header>
            <div class="card-header">
              <h3>垃圾站列表</h3>
              <el-input
                v-model="searchQuery"
                placeholder="搜索垃圾站"
                prefix-icon="Search"
                clearable
                style="width: 200px"
              />
            </div>
          </template>
          
          <el-table 
            :data="searchedStations"
            style="width: 100%"
            @row-click="handleRowClick"
            highlight-current-row
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="name" label="名称" min-width="150" />
            <el-table-column prop="address" label="位置" min-width="200" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  link 
                  size="small" 
                  @click.stop="viewDetail(scope.row)"
                >
                  详情
                </el-button>
                <el-button 
                  type="warning" 
                  link 
                  size="small" 
                  @click.stop="handleIssue(scope.row)"
                  v-if="scope.row.status !== 'normal'"
                >
                  处理
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12">
        <el-card class="station-detail-card" v-if="selectedStation">
          <template #header>
            <div class="card-header">
              <h3>{{ selectedStation.name }} 详情</h3>
              <el-button-group>
                <el-button 
                  type="primary" 
                  size="small"
                  @click="viewDetail(selectedStation)"
                >
                  详细信息
                </el-button>
                <el-button 
                  type="success" 
                  size="small"
                  @click="monitorStation(selectedStation)"
                >
                  状态监控
                </el-button>
              </el-button-group>
            </div>
          </template>
          
          <el-descriptions border :column="1">
            <el-descriptions-item label="垃圾站ID">{{ selectedStation.id }}</el-descriptions-item>
            <el-descriptions-item label="垃圾站名称">{{ selectedStation.name }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ selectedStation.address }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(selectedStation.status)">
                {{ getStatusText(selectedStation.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="设备数量">{{ selectedStation.deviceCount }} 台</el-descriptions-item>
            <el-descriptions-item label="今日回收量">{{ selectedStation.todayVolume }} kg</el-descriptions-item>
            <el-descriptions-item label="容量状态">
              <el-progress 
                :percentage="selectedStation.capacity" 
                :status="getCapacityStatus(selectedStation.capacity)"
              />
            </el-descriptions-item>
            <el-descriptions-item label="最近更新">{{ selectedStation.lastUpdate }}</el-descriptions-item>
          </el-descriptions>
          
          <div class="action-row">
            <el-button 
              type="primary" 
              @click="viewDetail(selectedStation)"
            >
              查看详情
            </el-button>
            <el-button 
              type="warning" 
              @click="handleIssue(selectedStation)"
              v-if="selectedStation.status !== 'normal'"
            >
              处理异常
            </el-button>
          </div>
        </el-card>
        
        <el-empty 
          v-else 
          description="请在地图或列表中选择垃圾站" 
          class="station-empty"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Refresh, Location, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getStationsList } from '@/services/adminService';

const router = useRouter();
const stations = ref([]);
const selectedStationId = ref(null);
const mapMode = ref('all');
const searchQuery = ref('');

// 获取选中的垃圾站
const selectedStation = computed(() => {
  return stations.value.find(station => station.id === selectedStationId.value);
});

// 根据筛选条件过滤垃圾站
const filteredStations = computed(() => {
  if (mapMode.value === 'all') {
    return stations.value;
  }
  return stations.value.filter(station => station.status === mapMode.value);
});

// 根据搜索条件过滤垃圾站列表
const searchedStations = computed(() => {
  if (!searchQuery.value) {
    return filteredStations.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return filteredStations.value.filter(station => 
    station.name.toLowerCase().includes(query) || 
    station.address.toLowerCase().includes(query)
  );
});

// 加载垃圾站数据
const loadStations = async () => {
  try {
    const res = await getStationsList();
    if (res.code === 200) {
      stations.value = res.data;
    } else {
      throw new Error(res.message || '获取垃圾站数据失败');
    }
  } catch (error) {
    console.error('获取垃圾站数据失败:', error);
    
    // 使用模拟数据
    stations.value = [
      {
        id: '1',
        name: '1号楼垃圾站',
        address: '小区东北角1号楼旁',
        status: 'normal',
        deviceCount: 5,
        todayVolume: 120.5,
        capacity: 45,
        lastUpdate: '2023-05-15 10:30:45',
        position: { x: 25, y: 30 }
      },
      {
        id: '2',
        name: '3号楼垃圾站',
        address: '小区中心3号楼旁',
        status: 'normal',
        deviceCount: 6,
        todayVolume: 98.2,
        capacity: 60,
        lastUpdate: '2023-05-15 10:15:22',
        position: { x: 45, y: 45 }
      },
      {
        id: '3',
        name: '5号楼垃圾站',
        address: '小区西南角5号楼旁',
        status: 'warning',
        deviceCount: 4,
        todayVolume: 156.8,
        capacity: 85,
        lastUpdate: '2023-05-15 09:45:10',
        position: { x: 65, y: 60 }
      },
      {
        id: '4',
        name: '7号楼垃圾站',
        address: '小区东南角7号楼旁',
        status: 'error',
        deviceCount: 5,
        todayVolume: 56.3,
        capacity: 30,
        lastUpdate: '2023-05-15 08:20:55',
        position: { x: 75, y: 35 }
      },
      {
        id: '5',
        name: '9号楼垃圾站',
        address: '小区西北角9号楼旁',
        status: 'normal',
        deviceCount: 4,
        todayVolume: 88.7,
        capacity: 50,
        lastUpdate: '2023-05-15 10:05:18',
        position: { x: 20, y: 65 }
      },
      {
        id: '6',
        name: '11号楼垃圾站',
        address: '小区北门11号楼旁',
        status: 'normal',
        deviceCount: 5,
        todayVolume: 102.4,
        capacity: 55,
        lastUpdate: '2023-05-15 09:30:40',
        position: { x: 40, y: 15 }
      }
    ];
    
    ElMessage.warning('使用模拟数据展示垃圾站地图');
  }
};

// 选择垃圾站
const selectStation = (station) => {
  selectedStationId.value = station.id;
};

// 查看垃圾站详情
const viewDetail = (station) => {
  router.push(`/admin/stations/${station.id}`);
};

// 处理垃圾站异常
const handleIssue = (station) => {
  router.push(`/admin/stations/issues?stationId=${station.id}`);
};

// 监控垃圾站状态
const monitorStation = (station) => {
  router.push(`/admin/stations/status?stationId=${station.id}`);
};

// 刷新地图
const refreshMap = () => {
  loadStations();
  ElMessage.success('地图数据已刷新');
};

// 表格行点击
const handleRowClick = (row) => {
  selectedStationId.value = row.id;
};

// 表格行样式
const tableRowClassName = ({ row }) => {
  if (row.id === selectedStationId.value) {
    return 'row-selected';
  }
  return '';
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

// 获取标记点类名
const getMarkerClass = (status) => {
  switch (status) {
    case 'normal': return 'marker-normal';
    case 'warning': return 'marker-warning';
    case 'error': return 'marker-error';
    default: return '';
  }
};

// 获取容量状态
const getCapacityStatus = (capacity) => {
  if (capacity >= 90) return 'exception';
  if (capacity >= 70) return 'warning';
  return 'success';
};

onMounted(() => {
  loadStations();
});
</script>

<style scoped>
.station-map-page {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h3 {
  margin: 0;
  font-size: 16px;
}

.map-card {
  margin-bottom: 20px;
}

.map-container {
  position: relative;
  height: 500px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.mock-map {
  width: 100%;
  height: 100%;
  position: relative;
}

.mock-map img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-marker {
  position: absolute;
  width: 32px;
  height: 32px;
  margin-left: -16px;
  margin-top: -32px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.map-marker i {
  font-size: 20px;
}

.marker-normal {
  background-color: #67c23a;
}

.marker-warning {
  background-color: #e6a23c;
}

.marker-error {
  background-color: #f56c6c;
}

.map-marker:hover {
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.station-info-section {
  margin-bottom: 20px;
}

.station-list-card,
.station-detail-card {
  height: 100%;
  margin-bottom: 20px;
}

.station-empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 4px;
  min-height: 300px;
}

.action-row {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.row-selected {
  background-color: #ecf5ff !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .map-container {
    height: 300px;
  }
}
</style> 