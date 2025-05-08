<template>
  <div class="search-page">
    <div class="search-header">
      <h2 class="page-title">垃圾分类查询</h2>
      <p class="page-description">输入垃圾名称，快速查询分类结果</p>
      
      <div class="search-box">
        <el-input 
          v-model="searchKeyword" 
          placeholder="请输入垃圾名称" 
          class="search-input"
          :clearable="true"
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
    
    <!-- 分类选择区域（统一设计） -->
    <div class="category-tabs">
      <el-tabs v-model="selectedTabCategory" type="card" @tab-click="handleTabCategoryChange">
        <el-tab-pane label="全部分类" name="">
          <div class="category-cards">
            <el-card 
              v-for="category in categories" 
              :key="category.id" 
              class="category-card"
              :class="{ 'active-category': selectedDetailCategory === category.name }"
              @click="handleDetailCategoryClick(category.name)"
            >
              <div class="category-icon" :style="{ backgroundColor: category.color }">
                <el-icon v-if="category.name === '可回收物'"><Delete /></el-icon>
                <el-icon v-else-if="category.name === '厨余垃圾'"><Apple /></el-icon>
                <el-icon v-else-if="category.name === '有害垃圾'"><Warning /></el-icon>
                <el-icon v-else><MoreFilled /></el-icon>
              </div>
              <h4>{{ category.name }}</h4>
              <p class="category-desc">{{ getCategoryDescription(category.name) }}</p>
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane 
          v-for="category in categories" 
          :key="category.id" 
          :label="category.name" 
          :name="category.name"
        >
          <div class="category-info">
            <div class="category-header">
              <div class="category-badge" :style="{ backgroundColor: category.color }"></div>
              <div class="category-title">
                <h3>{{ category.name }}</h3>
                <p>{{ getCategoryDescription(category.name) }}</p>
              </div>
            </div>
            
            <div class="category-guidelines">
              <h4>投放指南</h4>
              <ul>
                <li v-for="(guide, index) in getCategoryGuidelines(category.name)" :key="index">
                  {{ guide }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="waste-items">
            <h4>常见物品</h4>
            <div class="item-cards">
              <el-card v-for="item in getWasteItemsByCategory(category.name)" :key="item.id" class="waste-item-card">
                <div class="waste-item-content">
                  <div class="waste-item-image">
                    <img :src="item.imageUrl" :alt="item.name" />
                  </div>
                  <div class="waste-item-info">
                    <h4>{{ item.name }}</h4>
                    <p class="item-description">{{ item.description }}</p>
                    <p class="item-disposal"><strong>处理方式:</strong> {{ item.disposalMethod }}</p>
                    <el-button type="primary" link @click="goToDetail(item.id)">查看详情</el-button>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 搜索结果 -->
    <div v-if="isSearched" class="search-results">
      <div class="results-header">
        <h3 class="results-title">搜索结果 <small>(共{{ searchResults.length }}条)</small></h3>
        <el-button type="primary" text @click="clearSearch">
          <el-icon><Back /></el-icon> 返回分类浏览
        </el-button>
      </div>
      
      <el-empty v-if="searchResults.length === 0" description="没有找到相关结果" />
      <div v-else class="result-cards">
        <el-card v-for="item in searchResults" :key="item.id" class="result-card">
          <div class="result-header">
            <h4>{{ item.name }}</h4>
            <el-tag :type="getCategoryTagType(item.category)">{{ item.category }}</el-tag>
          </div>
          <p class="result-description">{{ item.description }}</p>
          <div class="result-disposal">
            <h5>处理方式</h5>
            <p>{{ item.disposalMethod }}</p>
          </div>
          <el-button type="primary" link @click="goToDetail(item.id)">查看详情</el-button>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search, Delete, Apple, Warning, MoreFilled, Back } from '@element-plus/icons-vue';
import { getWasteCategories, getWasteItems, searchWaste } from '@/services/wasteService';

const router = useRouter();
const route = useRoute();
const searchKeyword = ref('');
const selectedTabCategory = ref('');
const selectedDetailCategory = ref('');
const categories = ref([]);
const wasteItems = ref([]);
const searchResults = ref([]);
const isSearched = ref(false);

// 根据分类获取标签类型
const getCategoryTagType = (category) => {
  switch (category) {
    case '可回收物': return 'primary';
    case '厨余垃圾': return 'success';
    case '有害垃圾': return 'danger';
    case '其他垃圾': return '';
    default: return 'info';
  }
};

// 获取分类描述
const getCategoryDescription = (category) => {
  switch (category) {
    case '可回收物': 
      return '适宜回收和再利用的垃圾，如纸类、塑料、金属、玻璃等';
    case '厨余垃圾': 
      return '易腐烂的生物质垃圾，如剩菜剩饭、果皮、蔬菜等';
    case '有害垃圾': 
      return '对人体健康或环境造成直接或潜在危害的垃圾';
    case '其他垃圾': 
      return '难以回收的垃圾，如卫生纸、一次性餐具、旧陶瓷等';
    default: 
      return '请正确分类垃圾，共建美好环境';
  }
};

// 获取分类投放指南
const getCategoryGuidelines = (category) => {
  switch (category) {
    case '可回收物': 
      return [
        '投放前请清理残留物',
        '纸板要折叠压扁',
        '金属、塑料和玻璃应分开投放',
        '确保物品干燥无污染'
      ];
    case '厨余垃圾': 
      return [
        '沥干水分后再投放',
        '去除包装物后再投放',
        '大块骨头和果核应归入其他垃圾',
        '不可混入不可降解物质'
      ];
    case '有害垃圾': 
      return [
        '轻拿轻放，防止破损',
        '单独投放，不可混杂',
        '废电池应单独存放',
        '易破损物品应包裹后投放'
      ];
    case '其他垃圾': 
      return [
        '确保安全，避免尖锐物刺破垃圾袋',
        '投放前尽量压缩体积',
        '有害垃圾不应混入其中',
        '大件垃圾应按指引单独处理'
      ];
    default: 
      return [];
  }
};

// 根据分类筛选垃圾项目
const getWasteItemsByCategory = (category) => {
  return wasteItems.value.filter(item => item.category === category);
};

// 处理标签分类变化
const handleTabCategoryChange = (tab) => {
  selectedDetailCategory.value = tab.props.name;
  if (isSearched.value) {
    if (tab.props.name) {
      searchResults.value = searchResults.value.filter(item => item.category === tab.props.name);
    } else {
      handleSearch();
    }
  }
};

// 处理卡片分类点击
const handleDetailCategoryClick = (category) => {
  selectedTabCategory.value = category;
  selectedDetailCategory.value = category;
};

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = '';
  isSearched.value = false;
  router.push({ query: {} });
};

// 搜索垃圾
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    return;
  }
  
  isSearched.value = true;
  
  try {
    // 调用搜索接口
    const res = await searchWaste({ keyword: searchKeyword.value.trim() });
    if (res.code === 200) {
      searchResults.value = selectedTabCategory.value
        ? res.data.items.filter(item => item.category === selectedTabCategory.value)
        : res.data.items;
    }
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
  }
  
  // 更新URL查询参数
  router.push({
    query: {
      keyword: searchKeyword.value,
      ...(selectedTabCategory.value ? { category: selectedTabCategory.value } : {})
    }
  });
};

// 跳转到详情页
const goToDetail = (id) => {
  router.push(`/waste/detail/${id}`);
};

// 从URL获取初始查询参数
const initFromQuery = () => {
  const { keyword, category } = route.query;
  
  if (keyword) {
    searchKeyword.value = keyword;
  }
  
  if (category) {
    selectedTabCategory.value = category;
    selectedDetailCategory.value = category;
  }
  
  if (keyword) {
    handleSearch();
  }
};

onMounted(async () => {
  try {
    // 获取垃圾分类目录
    const categoriesRes = await getWasteCategories();
    if (categoriesRes.code === 200) {
      categories.value = categoriesRes.data;
    }
    
    // 获取所有垃圾项目
    const itemsRes = await getWasteItems({});
    if (itemsRes.code === 200) {
      wasteItems.value = itemsRes.data.items;
    }
    
    // 初始化查询
    initFromQuery();
  } catch (error) {
    console.error('获取数据失败:', error);
  }
});

// 监听路由变化
watch(
  () => route.query,
  (query) => {
    const { keyword, category } = query;
    
    if (keyword && keyword !== searchKeyword.value) {
      searchKeyword.value = keyword;
    }
    
    if (category && category !== selectedTabCategory.value) {
      selectedTabCategory.value = category;
      selectedDetailCategory.value = category;
    }
    
    if (keyword && keyword !== searchKeyword.value) {
      handleSearch();
    }
  }
);
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.page-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 30px;
}

.search-input {
  width: 100%;
}

/* 分类选择区域 */
.category-tabs {
  margin-bottom: 40px;
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.category-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.category-card.active-category {
  border-color: #409eff;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.category-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.category-card h4 {
  margin: 0 0 10px;
  font-size: 18px;
}

.category-desc {
  color: #666;
  font-size: 14px;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 分类详情 */
.category-info {
  margin-bottom: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.category-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 15px;
}

.category-title h3 {
  margin: 0 0 5px;
  font-size: 20px;
}

.category-title p {
  margin: 0;
  color: #666;
}

.category-guidelines {
  margin-bottom: 20px;
}

.category-guidelines h4 {
  margin: 0 0 10px;
  font-size: 16px;
}

.category-guidelines ul {
  padding-left: 20px;
  margin: 0;
}

.category-guidelines li {
  margin-bottom: 5px;
  color: #666;
}

/* 垃圾项目列表 */
.waste-items h4 {
  margin: 0 0 15px;
  font-size: 18px;
}

.item-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.waste-item-card {
  height: 100%;
}

.waste-item-content {
  display: flex;
  flex-direction: column;
}

.waste-item-image {
  width: 100%;
  height: 150px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 4px;
}

.waste-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.waste-item-info h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.item-description {
  color: #666;
  margin-bottom: 10px;
  font-size: 14px;
}

.item-disposal {
  margin-bottom: 15px;
  font-size: 14px;
}

/* 搜索结果 */
.search-results {
  margin-top: 30px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-title {
  font-size: 20px;
  margin: 0;
  display: flex;
  align-items: center;
}

.results-title small {
  font-size: 14px;
  color: #999;
  margin-left: 10px;
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.result-card {
  height: 100%;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.result-header h4 {
  margin: 0;
  font-size: 16px;
}

.result-description {
  color: #666;
  margin-bottom: 10px;
  font-size: 14px;
}

.result-disposal {
  margin-bottom: 15px;
}

.result-disposal h5 {
  font-size: 14px;
  margin-bottom: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .category-cards,
  .item-cards,
  .result-cards {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .category-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .category-badge {
    margin-bottom: 10px;
  }
}
</style> 