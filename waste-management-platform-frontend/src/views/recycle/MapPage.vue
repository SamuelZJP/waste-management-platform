<template>
  <div class="map-page">
    <div class="page-header">
      <h2 class="page-title">回收站地图</h2>
      <p class="page-description">查找附近回收站，实时查看状态</p>
    </div>
    
    <div class="search-box">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索回收站名称或地址"
        clearable
        @clear="loadAllRecyclePoints"
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div class="map-container">
      <div class="map-view">
        <div class="map-placeholder">
          <img src="@/assets/images/map-placeholder.svg" alt="地图" class="map-image" />
          <div 
            v-for="point in displayPoints" 
            :key="point.id" 
            class="map-marker" 
            :style="{
              left: getMarkerPosition(point).x + '%',
              top: getMarkerPosition(point).y + '%',
              backgroundColor: getStatusColor(point.status)
            }"
            @click="selectRecyclePoint(point)"
            :class="{ 'marker-active': selectedPoint && selectedPoint.id === point.id }"
          >
            <span class="marker-label">{{ point.id }}</span>
          </div>
        </div>
      </div>
      
      <div class="points-list">
        <div class="list-header">
          <h3>回收站列表</h3>
          <div class="list-filter">
            <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="filterRecyclePoints">
              <el-option label="全部" value="" />
              <el-option label="在线" :value="1" />
              <el-option label="离线" :value="0" />
              <el-option label="故障" :value="2" />
            </el-select>
          </div>
        </div>
        
        <div class="points-scroll">
          <el-card 
            v-for="point in displayPoints" 
            :key="point.id" 
            class="point-card"
            :class="{ 'card-active': selectedPoint && selectedPoint.id === point.id }"
            @click="selectRecyclePoint(point)"
          >
            <div class="point-header">
              <h4>{{ point.name }}</h4>
              <div 
                class="point-status" 
                :class="{
                  'status-online': point.status === 1,
                  'status-offline': point.status === 0,
                  'status-fault': point.status === 2
                }"
              >
                {{ getStatusText(point.status) }}
              </div>
            </div>
            <p class="point-address">
              <el-icon><Location /></el-icon>
              {{ point.address }}
            </p>
            <p class="point-hours">
              <el-icon><Clock /></el-icon>
              {{ point.openingHours }}
            </p>
            <div class="point-capacity">
              <span>当前容量: {{ point.capacity }}%</span>
              <el-progress :percentage="point.capacity" :color="getCapacityColor(point.capacity)" />
            </div>
            <div class="point-footer">
              <span class="point-distance">
                <el-icon><Position /></el-icon>
                距离: {{ point.distance }}米
              </span>
              <el-button size="small" type="primary" @click.stop="goToDetail(point.id)">详情</el-button>
            </div>
          </el-card>
          
          <el-empty v-if="displayPoints.length === 0" description="没有找到符合条件的回收站" />
        </div>
      </div>
    </div>
    
    <!-- 回收站详情弹窗 -->
    <el-dialog
      v-model="showPointDetail"
      title="回收站详情"
      width="80%"
      class="point-detail-dialog"
      destroy-on-close
    >
      <div v-if="selectedPoint" class="point-detail">
        <div class="detail-header">
          <img :src="selectedPoint.imageUrl" alt="回收站图片" class="detail-image" />
          <div class="detail-title">
            <h3>{{ selectedPoint.name }}</h3>
            <div 
              class="point-status" 
              :class="{
                'status-online': selectedPoint.status === 1,
                'status-offline': selectedPoint.status === 0,
                'status-fault': selectedPoint.status === 2
              }"
            >
              {{ getStatusText(selectedPoint.status) }}
            </div>
          </div>
        </div>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="地址">{{ selectedPoint.address }}</el-descriptions-item>
          <el-descriptions-item label="开放时间">{{ selectedPoint.openingHours }}</el-descriptions-item>
          <el-descriptions-item label="接收垃圾类型">{{ selectedPoint.wasteTypes.join(', ') }}</el-descriptions-item>
          <el-descriptions-item label="联系方式">{{ selectedPoint.contact }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-capacity">
          <h4>容量信息</h4>
          <div class="capacity-charts">
            <div class="capacity-overall">
              <h5>总体容量: {{ selectedPoint.capacity }}%</h5>
              <el-progress type="dashboard" :percentage="selectedPoint.capacity" :color="getCapacityColor(selectedPoint.capacity)" />
            </div>
            <div class="capacity-categories">
              <div v-for="(item, index) in wasteCapacity" :key="index" class="category-capacity">
                <span>{{ item.type }}: {{ item.capacity }}%</span>
                <el-progress :percentage="item.capacity" :color="getCapacityColor(item.capacity)" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-actions">
          <el-button type="primary" @click="goToDetail(selectedPoint.id)">查看完整详情</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Location, Clock, Position } from '@element-plus/icons-vue';
import { getNearbyRecyclePoints, getRecyclePointCapacity } from '@/services/recycleService';

const router = useRouter();
const recyclePoints = ref([]);
const filteredPoints = ref([]);
const displayPoints = ref([]);
const selectedPoint = ref(null);
const searchKeyword = ref('');
const filterStatus = ref('');
const showPointDetail = ref(false);
const wasteCapacity = ref([
  { type: '可回收物', capacity: 65 },
  { type: '厨余垃圾', capacity: 40 },
  { type: '有害垃圾', capacity: 20 },
  { type: '其他垃圾', capacity: 70 }
]);

// 获取状态颜色
const getStatusColor = (status) => {
  switch (status) {
    case 0: return '#909399'; // 离线
    case 1: return '#67c23a'; // 在线
    case 2: return '#f56c6c'; // 故障
    default: return '#909399';
  }
};

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
  if (capacity < 50) return '#67c23a';
  if (capacity < 80) return '#e6a23c';
  return '#f56c6c';
};

// 获取标记位置（模拟地图位置计算，实际应根据经纬度计算）
const getMarkerPosition = (point) => {
  // 这里用一个简单算法模拟经纬度到像素的转换
  // 实际项目中应该使用真实地图API计算
  const xPercent = ((point.longitude - 116.3) * 10) % 90 + 5;
  const yPercent = ((point.latitude - 39.9) * 10) % 85 + 5;
  
  return {
    x: xPercent,
    y: yPercent
  };
};

// 加载所有回收点
const loadAllRecyclePoints = async () => {
  try {
    // 模拟当前位置
    const currentPosition = {
      longitude: 116.3975,
      latitude: 39.9085,
      radius: 5000
    };
    
    const res = await getNearbyRecyclePoints(currentPosition);
    if (res.code === 200) {
      recyclePoints.value = res.data.points;
      filteredPoints.value = [...recyclePoints.value];
      displayPoints.value = [...recyclePoints.value];
    }
  } catch (error) {
    console.error('获取回收点数据失败:', error);
  }
};

// 搜索回收站
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    filteredPoints.value = [...recyclePoints.value];
  } else {
    const keyword = searchKeyword.value.toLowerCase();
    filteredPoints.value = recyclePoints.value.filter(point => 
      point.name.toLowerCase().includes(keyword) || 
      point.address.toLowerCase().includes(keyword)
    );
  }
  
  filterRecyclePoints();
};

// 筛选回收站（根据状态）
const filterRecyclePoints = () => {
  if (filterStatus.value === '') {
    displayPoints.value = [...filteredPoints.value];
  } else {
    displayPoints.value = filteredPoints.value.filter(point => 
      point.status === filterStatus.value
    );
  }
};

// 选择回收点
const selectRecyclePoint = async (point) => {
  selectedPoint.value = point;
  showPointDetail.value = true;
  
  try {
    // 获取容量详情
    const res = await getRecyclePointCapacity(point.id);
    if (res.code === 200) {
      wasteCapacity.value = res.data.wasteCapacity;
    }
  } catch (error) {
    console.error('获取容量数据失败:', error);
  }
};

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/recycle/detail/${id}`);
};

onMounted(() => {
  loadAllRecyclePoints();
});
</script>

<style scoped>
.map-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.page-description {
  font-size: 16px;
  color: #666;
}

.search-box {
  margin-bottom: 20px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.map-container {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.map-view {
  flex: 1;
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-marker {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #67c23a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
  transition: all 0.3s;
  z-index: 1;
}

.map-marker:hover, .marker-active {
  width: 40px;
  height: 40px;
  z-index: 2;
}

.marker-label {
  font-weight: bold;
}

.points-list {
  width: 350px;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  margin: 0;
  font-size: 18px;
}

.points-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 570px;
  padding-right: 10px;
}

.point-card {
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.point-card:hover, .card-active {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.point-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.point-header h4 {
  margin: 0;
  font-size: 16px;
}

.point-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
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

.point-address, .point-hours {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 5px;
}

.point-capacity {
  margin: 12px 0;
}

.point-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.point-distance {
  font-size: 14px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 5px;
}

.point-detail {
  padding: 10px;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.detail-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title h3 {
  margin: 0;
  font-size: 20px;
}

.detail-capacity {
  margin: 20px 0;
}

.detail-capacity h4 {
  margin-bottom: 16px;
  font-size: 18px;
}

.capacity-charts {
  display: flex;
  gap: 20px;
}

.capacity-overall {
  flex: 1;
  text-align: center;
}

.capacity-categories {
  flex: 2;
}

.category-capacity {
  margin-bottom: 12px;
}

.detail-actions {
  margin-top: 20px;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .map-container {
    flex-direction: column;
  }
  
  .map-view {
    height: 400px;
  }
  
  .points-list {
    width: 100%;
  }
  
  .capacity-charts {
    flex-direction: column;
  }
  
  .capacity-overall, .capacity-categories {
    width: 100%;
  }
  
  .capacity-overall {
    margin-bottom: 20px;
  }
}
</style> 