<template>
  <div class="statistics-page">
    <div class="page-header">
      <h1>数据统计分析</h1>
      <p class="page-description">查看垃圾回收和分类的详细数据统计及趋势分析</p>
    </div>
    
    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="垃圾站">
          <el-select v-model="filterForm.stationId" placeholder="选择垃圾站" style="width: 180px">
            <el-option label="全部垃圾站" value="all" />
            <el-option 
              v-for="station in stations" 
              :key="station.id" 
              :label="station.name" 
              :value="station.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilter">应用筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据概览 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :xs="12" :sm="6" :md="3">
        <el-card shadow="hover" class="data-card">
          <div class="data-title">回收总量</div>
          <div class="data-value primary">{{ dataOverview.totalWeight }} kg</div>
          <div class="data-footer">
            <span :class="dataOverview.weightTrend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="dataOverview.weightTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ Math.abs(dataOverview.weightTrend) }}%
            </span>
            <span class="trend-text">同比上期</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="3">
        <el-card shadow="hover" class="data-card">
          <div class="data-title">参与用户</div>
          <div class="data-value success">{{ dataOverview.totalUsers }}</div>
          <div class="data-footer">
            <span :class="dataOverview.userTrend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="dataOverview.userTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ Math.abs(dataOverview.userTrend) }}%
            </span>
            <span class="trend-text">同比上期</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="3">
        <el-card shadow="hover" class="data-card">
          <div class="data-title">回收次数</div>
          <div class="data-value info">{{ dataOverview.totalTimes }}</div>
          <div class="data-footer">
            <span :class="dataOverview.timesTrend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="dataOverview.timesTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ Math.abs(dataOverview.timesTrend) }}%
            </span>
            <span class="trend-text">同比上期</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="3">
        <el-card shadow="hover" class="data-card">
          <div class="data-title">日均回收</div>
          <div class="data-value warning">{{ dataOverview.dailyAvg }} kg</div>
          <div class="data-footer">
            <span :class="dataOverview.dailyTrend > 0 ? 'trend-up' : 'trend-down'">
              <el-icon v-if="dataOverview.dailyTrend > 0"><CaretTop /></el-icon>
              <el-icon v-else><CaretBottom /></el-icon>
              {{ Math.abs(dataOverview.dailyTrend) }}%
            </span>
            <span class="trend-text">同比上期</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>垃圾分类占比</h3>
              <el-select v-model="categoryChartType" placeholder="图表类型" style="width: 100px">
                <el-option label="饼图" value="pie" />
                <el-option label="柱状图" value="bar" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <!-- 实际项目中应使用ECharts等图表库 -->
            <img 
              :src="`https://via.placeholder.com/600x300?text=垃圾分类${categoryChartType === 'pie' ? '饼图' : '柱状图'}`" 
              :alt="`垃圾分类${categoryChartType === 'pie' ? '饼图' : '柱状图'}`" 
            />
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>回收趋势</h3>
              <el-select v-model="trendChartInterval" placeholder="时间间隔" style="width: 100px">
                <el-option label="日" value="day" />
                <el-option label="周" value="week" />
                <el-option label="月" value="month" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <!-- 实际项目中应使用ECharts等图表库 -->
            <img 
              :src="`https://via.placeholder.com/600x300?text=回收趋势图(${trendChartInterval})`" 
              :alt="`回收趋势图(${trendChartInterval})`" 
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-section">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>用户参与情况</h3>
              <el-select v-model="userChartType" placeholder="用户类型" style="width: 100px">
                <el-option label="全部" value="all" />
                <el-option label="活跃" value="active" />
                <el-option label="新增" value="new" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <!-- 实际项目中应使用ECharts等图表库 -->
            <img 
              :src="`https://via.placeholder.com/600x300?text=用户参与图表(${userChartType}用户)`" 
              :alt="`用户参与图表(${userChartType}用户)`" 
            />
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>垃圾站回收量排名</h3>
              <el-button type="primary" link @click="refreshRanking">
                刷新排名
              </el-button>
            </div>
          </template>
          <el-table
            :data="stationRanking"
            style="width: 100%"
          >
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="name" label="垃圾站" min-width="150" />
            <el-table-column prop="weight" label="回收量(kg)" width="120" />
            <el-table-column label="占比" width="120">
              <template #default="scope">
                <el-progress 
                  :percentage="scope.row.percentage" 
                  :color="getRandomColor(scope.$index)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="userCount" label="用户数" width="100" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 详细数据 -->
    <el-card shadow="hover" class="data-details-card">
      <template #header>
        <div class="card-header">
          <h3>详细数据</h3>
          <div class="header-actions">
            <el-button type="primary" @click="exportData">
              <el-icon><Download /></el-icon> 导出数据
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="日期汇总" name="date">
          <el-table
            :data="dateData"
            style="width: 100%"
            v-loading="loading"
            max-height="400"
          >
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="totalWeight" label="回收总量(kg)" width="120" />
            <el-table-column prop="userCount" label="用户数" width="100" />
            <el-table-column prop="recycleCount" label="回收次数" width="100" />
            <el-table-column prop="kitchenWaste" label="厨余垃圾(kg)" width="120" />
            <el-table-column prop="recyclableWaste" label="可回收物(kg)" width="120" />
            <el-table-column prop="harmfulWaste" label="有害垃圾(kg)" width="120" />
            <el-table-column prop="otherWaste" label="其他垃圾(kg)" width="120" />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="垃圾站汇总" name="station">
          <el-table
            :data="stationData"
            style="width: 100%"
            v-loading="loading"
            max-height="400"
          >
            <el-table-column prop="name" label="垃圾站" min-width="150" />
            <el-table-column prop="totalWeight" label="回收总量(kg)" width="120" />
            <el-table-column prop="userCount" label="用户数" width="100" />
            <el-table-column prop="recycleCount" label="回收次数" width="100" />
            <el-table-column prop="kitchenWaste" label="厨余垃圾(kg)" width="120" />
            <el-table-column prop="recyclableWaste" label="可回收物(kg)" width="120" />
            <el-table-column prop="harmfulWaste" label="有害垃圾(kg)" width="120" />
            <el-table-column prop="otherWaste" label="其他垃圾(kg)" width="120" />
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="分类明细" name="category">
          <el-table
            :data="categoryData"
            style="width: 100%"
            v-loading="loading"
            max-height="400"
          >
            <el-table-column prop="category" label="垃圾分类" min-width="150" />
            <el-table-column prop="totalWeight" label="回收总量(kg)" width="120" />
            <el-table-column prop="percentage" label="占比" width="120">
              <template #default="scope">
                {{ scope.row.percentage }}%
              </template>
            </el-table-column>
            <el-table-column prop="userCount" label="用户数" width="100" />
            <el-table-column prop="recycleCount" label="回收次数" width="100" />
            <el-table-column prop="avgWeight" label="平均每次(kg)" width="120" />
            <el-table-column label="同比上期" width="120">
              <template #default="scope">
                <span :class="scope.row.trend > 0 ? 'trend-up' : 'trend-down'">
                  <el-icon v-if="scope.row.trend > 0"><CaretTop /></el-icon>
                  <el-icon v-else><CaretBottom /></el-icon>
                  {{ Math.abs(scope.row.trend) }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  CaretTop, CaretBottom, Download, Refresh
} from '@element-plus/icons-vue';
import { getStatisticsData } from '@/services/adminService';

const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);
const activeTab = ref('date');

// 图表选择
const categoryChartType = ref('pie');
const trendChartInterval = ref('day');
const userChartType = ref('all');

// 筛选表单
const filterForm = ref({
  stationId: 'all',
  dateRange: []
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

// 数据概览
const dataOverview = ref({
  totalWeight: 0,
  weightTrend: 0,
  totalUsers: 0,
  userTrend: 0,
  totalTimes: 0,
  timesTrend: 0,
  dailyAvg: 0,
  dailyTrend: 0
});

// 垃圾站排名数据
const stationRanking = ref([]);

// 各类数据
const dateData = ref([]);
const stationData = ref([]);
const categoryData = ref([]);

// 随机颜色
const getRandomColor = (index) => {
  const colors = [
    '#67C23A', '#409EFF', '#E6A23C', '#F56C6C', 
    '#909399', '#9254DE', '#36CFC9', '#FF9C6E'
  ];
  return colors[index % colors.length];
};

// 应用筛选
const applyFilter = () => {
  currentPage.value = 1;
  loadData();
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    stationId: 'all',
    dateRange: []
  };
  applyFilter();
};

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadData();
};

// 每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadData();
};

// 刷新排名
const refreshRanking = () => {
  loadStationRanking();
  ElMessage.success('垃圾站排名已刷新');
};

// 导出数据
const exportData = () => {
  ElMessage.success('数据导出功能尚未实现');
  // 实际项目中应导出CSV或Excel文件
};

// 刷新数据
const refreshData = () => {
  loadData();
  ElMessage.success('数据已刷新');
};

// 加载统计数据
const loadData = async () => {
  loading.value = true;
  
  try {
    const params = {
      stationId: filterForm.value.stationId,
      startDate: filterForm.value.dateRange[0] || undefined,
      endDate: filterForm.value.dateRange[1] || undefined,
      page: currentPage.value,
      limit: pageSize.value,
      tabType: activeTab.value
    };
    
    const res = await getStatisticsData(params);
    if (res.code === 200) {
      dataOverview.value = res.data.overview;
      
      switch (activeTab.value) {
        case 'date':
          dateData.value = res.data.list;
          break;
        case 'station':
          stationData.value = res.data.list;
          break;
        case 'category':
          categoryData.value = res.data.list;
          break;
      }
      
      totalItems.value = res.data.total;
      
      if (!stationRanking.value.length) {
        loadStationRanking();
      }
    } else {
      throw new Error(res.message || '获取统计数据失败');
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
    
    // 使用模拟数据
    mockStatisticsData();
    ElMessage.warning('使用模拟数据展示统计图表');
  } finally {
    loading.value = false;
  }
};

// 加载垃圾站排名
const loadStationRanking = () => {
  // 实际项目中应调用API获取排名数据
  // 这里使用模拟数据
  const totalWeight = 1000; // 假设总重量为1000kg
  
  stationRanking.value = stations.value.map(station => {
    const weight = 50 + Math.floor(Math.random() * 300);
    const percentage = Math.round((weight / totalWeight) * 100);
    
    return {
      id: station.id,
      name: station.name,
      weight: weight,
      percentage: percentage,
      userCount: 20 + Math.floor(Math.random() * 100)
    };
  }).sort((a, b) => b.weight - a.weight);
};

// 模拟统计数据
const mockStatisticsData = () => {
  // 概览数据
  dataOverview.value = {
    totalWeight: 1530.5,
    weightTrend: 8.3,
    totalUsers: 425,
    userTrend: 12.5,
    totalTimes: 1256,
    timesTrend: -3.8,
    dailyAvg: 153.1,
    dailyTrend: 5.2
  };
  
  // 日期数据
  dateData.value = [];
  const today = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const totalWeight = 50 + Math.floor(Math.random() * 150);
    
    dateData.value.push({
      date: formattedDate,
      totalWeight: totalWeight,
      userCount: 15 + Math.floor(Math.random() * 50),
      recycleCount: 40 + Math.floor(Math.random() * 60),
      kitchenWaste: Math.round(totalWeight * 0.4),
      recyclableWaste: Math.round(totalWeight * 0.3),
      harmfulWaste: Math.round(totalWeight * 0.1),
      otherWaste: Math.round(totalWeight * 0.2)
    });
  }
  
  // 垃圾站数据
  stationData.value = stations.value.map(station => {
    const totalWeight = 50 + Math.floor(Math.random() * 300);
    
    return {
      id: station.id,
      name: station.name,
      totalWeight: totalWeight,
      userCount: 20 + Math.floor(Math.random() * 100),
      recycleCount: 40 + Math.floor(Math.random() * 150),
      kitchenWaste: Math.round(totalWeight * 0.4),
      recyclableWaste: Math.round(totalWeight * 0.3),
      harmfulWaste: Math.round(totalWeight * 0.1),
      otherWaste: Math.round(totalWeight * 0.2)
    };
  });
  
  // 分类数据
  categoryData.value = [
    {
      category: '厨余垃圾',
      totalWeight: 612.2,
      percentage: 40,
      userCount: 320,
      recycleCount: 863,
      avgWeight: 0.71,
      trend: 12.5
    },
    {
      category: '可回收物',
      totalWeight: 459.2,
      percentage: 30,
      userCount: 280,
      recycleCount: 651,
      avgWeight: 0.71,
      trend: 8.3
    },
    {
      category: '有害垃圾',
      totalWeight: 153.0,
      percentage: 10,
      userCount: 156,
      recycleCount: 320,
      avgWeight: 0.48,
      trend: -2.1
    },
    {
      category: '其他垃圾',
      totalWeight: 306.1,
      percentage: 20,
      userCount: 278,
      recycleCount: 542,
      avgWeight: 0.56,
      trend: 3.7
    }
  ];
  
  // 垃圾站排名
  loadStationRanking();
  
  totalItems.value = activeTab.value === 'date' ? 15 : 
    activeTab.value === 'station' ? stations.value.length : 4;
};

onMounted(() => {
  // 设置默认日期范围为最近15天
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 14);
  
  filterForm.value.dateRange = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ];
  
  loadData();
});
</script>

<style scoped>
.statistics-page {
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
  align-items: center;
}

.data-overview {
  margin-bottom: 20px;
}

.data-card {
  text-align: center;
  padding: 15px;
  margin-bottom: 20px;
  height: 100%;
}

.data-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.data-value.primary {
  color: #409eff;
}

.data-value.success {
  color: #67c23a;
}

.data-value.warning {
  color: #e6a23c;
}

.data-value.info {
  color: #909399;
}

.data-footer {
  display: flex;
  justify-content: center;
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

.chart-section {
  margin-bottom: 20px;
}

.chart-card {
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

.header-actions {
  display: flex;
  gap: 10px;
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

.data-details-card {
  margin-bottom: 20px;
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
    align-items: flex-start;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
    margin-bottom: 15px;
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
  
  .data-card {
    margin-bottom: 15px;
  }
}
</style> 