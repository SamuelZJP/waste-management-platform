<template>
  <div class="home-page">
    <div class="banner">
      <div class="banner-content">
        <h1>智能垃圾管理平台</h1>
        <p>提高垃圾分类效率，优化垃圾回收流程，实现智能化管理</p>
        <div class="search-box">
          <el-input 
            v-model="searchKeyword" 
            placeholder="输入垃圾名称，查询分类信息" 
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <div class="category-section">
      <h2 class="section-title">垃圾分类指南</h2>
      <div class="category-cards">
        <el-card v-for="category in categories" :key="category.id" class="category-card" :style="{ borderColor: category.color }">
          <div class="category-icon" :style="{ backgroundColor: category.color }">
            <el-icon><component :is="iconMap[category.icon]" /></el-icon>
          </div>
          <h3>{{ category.name }}</h3>
          <p>{{ getCategoryDescription(category.name) }}</p>
          <el-button type="primary" text @click="goToCategoryDetail(category.name)">查看详情</el-button>
        </el-card>
      </div>
    </div>

    <div class="feature-section">
      <h2 class="section-title">智能功能</h2>
      <div class="feature-cards">
        <el-card class="feature-card">
          <el-icon class="feature-icon"><Camera /></el-icon>
          <h3>垃圾识别</h3>
          <p>上传图片，AI智能识别垃圾类别</p>
          <el-button type="primary" @click="goToFeature('recognize')">立即使用</el-button>
        </el-card>
        <el-card class="feature-card">
          <el-icon class="feature-icon"><Search /></el-icon>
          <h3>垃圾分类查询</h3>
          <p>快速查询垃圾分类知识</p>
          <el-button type="primary" @click="goToFeature('search')">立即使用</el-button>
        </el-card>
        <el-card class="feature-card">
          <el-icon class="feature-icon"><Location /></el-icon>
          <h3>回收站导航</h3>
          <p>查找附近回收点，实时查看状态</p>
          <el-button type="primary" @click="goToFeature('map')">立即使用</el-button>
        </el-card>
      </div>
    </div>

    <div class="recyclepoint-section">
      <h2 class="section-title">附近回收站</h2>
      <div class="recyclepoint-cards">
        <el-card v-for="point in recyclePoints.slice(0, 3)" :key="point.id" class="recyclepoint-card">
          <div class="recyclepoint-header">
            <img :src="point.imageUrl" alt="回收点图片" class="recyclepoint-image" />
            <div class="recyclepoint-status" :class="{ 'status-online': point.status === 1, 'status-offline': point.status === 0, 'status-fault': point.status === 2 }">
              {{ getStatusText(point.status) }}
            </div>
          </div>
          <h3>{{ point.name }}</h3>
          <p class="recyclepoint-address">{{ point.address }}</p>
          <div class="recyclepoint-info">
            <p><el-icon><Clock /></el-icon> {{ point.openingHours }}</p>
            <div class="capacity-bar">
              <div class="capacity-label">当前容量：{{ point.capacity }}%</div>
              <el-progress :percentage="point.capacity" :color="getCapacityColor(point.capacity)" />
            </div>
          </div>
          <el-button type="primary" @click="goToRecycleDetail(point.id)">详情</el-button>
        </el-card>
      </div>
      <div class="more-button">
        <el-button type="primary" plain @click="goToRecycleMap">查看更多回收站</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Camera, Location, Clock } from '@element-plus/icons-vue';
import { getWasteCategories } from '@/services/wasteService';
import { getAllRecyclePoints } from '@/services/recycleService';

const router = useRouter();
const searchKeyword = ref('');
const categories = ref([]);
const recyclePoints = ref([]);

// 图标映射
const iconMap = {
  recycle: 'Refresh',
  food: 'Food',
  danger: 'Warning',
  other: 'More'
};

// 分类描述
const categoryDescriptions = {
  '可回收物': '适宜回收和资源利用的垃圾，如纸类、塑料、玻璃、金属等',
  '厨余垃圾': '易腐烂的生物质生活垃圾，如剩菜剩饭、果皮等',
  '有害垃圾': '对人体健康或环境有害的生活垃圾，如废电池、过期药品等',
  '其他垃圾': '除可回收物、厨余垃圾、有害垃圾以外的垃圾'
};

// 获取分类描述
const getCategoryDescription = (categoryName) => {
  return categoryDescriptions[categoryName] || '';
};

// 获取容量颜色
const getCapacityColor = (capacity) => {
  if (capacity < 50) return '#67c23a';
  if (capacity < 80) return '#e6a23c';
  return '#f56c6c';
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

onMounted(async () => {
  try {
    // 获取垃圾分类目录
    const categoriesRes = await getWasteCategories();
    if (categoriesRes.code === 200) {
      categories.value = categoriesRes.data;
    }
    
    // 获取所有回收点
    const recyclePointsRes = await getAllRecyclePoints();
    if (recyclePointsRes.code === 200) {
      recyclePoints.value = recyclePointsRes.data;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  }
});

// 搜索垃圾
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/waste/search',
      query: { keyword: searchKeyword.value.trim() }
    });
  }
};

// 前往分类详情
const goToCategoryDetail = (categoryName) => {
  router.push({
    path: '/waste/search',
    query: { category: categoryName }
  });
};

// 前往功能页面
const goToFeature = (feature) => {
  switch (feature) {
    case 'recognize':
      router.push('/waste/recognize');
      break;
    case 'search':
      router.push('/waste/search');
      break;
    case 'map':
      router.push('/recycle/map');
      break;
  }
};

// 前往回收点详情
const goToRecycleDetail = (id) => {
  router.push(`/recycle/detail/${id}`);
};

// 前往回收站地图页面
const goToRecycleMap = () => {
  router.push('/recycle/map');
};
</script>

<style scoped>
.home-page {
  width: 100%;
}

.banner {
  background-image: linear-gradient(135deg, #1e88e5, #00c853);
  color: white;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 40px;
  border-radius: 8px;
}

.banner-content {
  max-width: 800px;
  padding: 0 20px;
}

.banner h1 {
  font-size: 32px;
  margin-bottom: 16px;
}

.banner p {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  border-radius: 100px;
}

.section-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
  position: relative;
}

.section-title:after {
  content: '';
  display: block;
  width: 50px;
  height: 3px;
  background-color: #1e88e5;
  margin: 10px auto 0;
}

.category-section, .feature-section, .recyclepoint-section {
  margin-bottom: 60px;
}

.category-cards, .feature-cards, .recyclepoint-cards {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.category-card {
  flex: 1;
  min-width: 220px;
  text-align: center;
  border-top: 3px solid;
  transition: transform 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.category-icon .el-icon {
  font-size: 30px;
  color: white;
}

.feature-card {
  flex: 1;
  min-width: 300px;
  text-align: center;
  padding: 30px 20px;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 48px;
  color: #1e88e5;
  margin-bottom: 15px;
}

.recyclepoint-card {
  flex: 1;
  min-width: 300px;
  max-width: 350px;
}

.recyclepoint-header {
  position: relative;
  margin-bottom: 15px;
}

.recyclepoint-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
}

.recyclepoint-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
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

.recyclepoint-address {
  color: #666;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recyclepoint-info {
  margin-bottom: 15px;
}

.recyclepoint-info p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  color: #666;
}

.capacity-bar {
  margin-top: 10px;
}

.capacity-label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.more-button {
  text-align: center;
  margin-top: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner {
    height: 300px;
  }
  
  .banner h1 {
    font-size: 24px;
  }
  
  .banner p {
    font-size: 16px;
  }
  
  .category-cards, .feature-cards, .recyclepoint-cards {
    flex-direction: column;
  }
  
  .category-card, .feature-card, .recyclepoint-card {
    width: 100%;
    max-width: none;
  }
}
</style> 