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
    
    <div class="category-filter">
      <el-radio-group v-model="selectedCategory" size="large" @change="handleCategoryChange">
        <el-radio-button label="">全部</el-radio-button>
        <el-radio-button v-for="category in categories" :key="category.id" :label="category.name">
          <span class="category-dot" :style="{ backgroundColor: category.color }"></span>
          {{ category.name }}
        </el-radio-button>
      </el-radio-group>
    </div>
    
    <!-- 搜索结果 -->
    <div v-if="isSearched" class="search-results">
      <h3 class="results-title">搜索结果 <small>(共{{ searchResults.length }}条)</small></h3>
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
    
    <!-- 常见垃圾分类列表 -->
    <div v-else class="common-waste-list">
      <h3 class="common-title">常见垃圾分类</h3>
      <el-tabs v-model="activeTab" class="common-tabs">
        <el-tab-pane v-for="category in categories" :key="category.id" :label="category.name" :name="category.name">
          <div class="tab-content">
            <el-card v-for="item in getWasteItemsByCategory(category.name)" :key="item.id" class="common-card">
              <div class="common-card-content">
                <div class="common-card-image">
                  <img :src="item.imageUrl" :alt="item.name" />
                </div>
                <div class="common-card-info">
                  <h4>{{ item.name }}</h4>
                  <p class="item-description">{{ item.description }}</p>
                  <p class="item-disposal"><strong>处理方式:</strong> {{ item.disposalMethod }}</p>
                  <el-button type="primary" link @click="goToDetail(item.id)">查看详情</el-button>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { getWasteCategories, getWasteItems, searchWaste } from '@/services/wasteService';

const router = useRouter();
const route = useRoute();
const searchKeyword = ref('');
const selectedCategory = ref('');
const activeTab = ref('可回收物');
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

// 根据分类筛选垃圾项目
const getWasteItemsByCategory = (category) => {
  return wasteItems.value.filter(item => item.category === category);
};

// 处理分类变化
const handleCategoryChange = () => {
  if (isSearched.value) {
    handleSearch();
  }
};

// 搜索垃圾
const handleSearch = async () => {
  if (!searchKeyword.value.trim() && !selectedCategory.value) {
    isSearched.value = false;
    return;
  }
  
  isSearched.value = true;
  
  try {
    if (searchKeyword.value.trim()) {
      // 有关键词时调用搜索接口
      const res = await searchWaste({ keyword: searchKeyword.value.trim() });
      if (res.code === 200) {
        searchResults.value = selectedCategory.value
          ? res.data.items.filter(item => item.category === selectedCategory.value)
          : res.data.items;
      }
    } else if (selectedCategory.value) {
      // 只有分类筛选时
      searchResults.value = wasteItems.value.filter(item => item.category === selectedCategory.value);
    }
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [];
  }
  
  // 更新URL查询参数
  router.push({
    query: {
      ...(searchKeyword.value ? { keyword: searchKeyword.value } : {}),
      ...(selectedCategory.value ? { category: selectedCategory.value } : {})
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
    selectedCategory.value = category;
    activeTab.value = category;
  }
  
  if (keyword || category) {
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
    
    if (category && category !== selectedCategory.value) {
      selectedCategory.value = category;
      activeTab.value = category;
    }
    
    if ((keyword && keyword !== searchKeyword.value) || 
        (category && category !== selectedCategory.value)) {
      handleSearch();
    }
  }
);
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
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
}

.search-input {
  width: 100%;
}

.category-filter {
  margin-bottom: 30px;
  text-align: center;
}

.category-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.search-results {
  margin-bottom: 40px;
}

.results-title {
  font-size: 20px;
  margin-bottom: 20px;
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  font-size: 18px;
}

.result-description {
  color: #666;
  margin-bottom: 10px;
}

.result-disposal {
  margin-bottom: 15px;
}

.result-disposal h5 {
  font-size: 16px;
  margin-bottom: 5px;
}

.common-waste-list {
  margin-bottom: 40px;
}

.common-title {
  font-size: 20px;
  margin-bottom: 20px;
}

.tab-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.common-card {
  height: 100%;
}

.common-card-content {
  display: flex;
  flex-direction: column;
}

.common-card-image {
  width: 100%;
  height: 150px;
  overflow: hidden;
  margin-bottom: 15px;
  border-radius: 4px;
}

.common-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.common-card-info h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.item-description {
  color: #666;
  margin-bottom: 10px;
}

.item-disposal {
  margin-bottom: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .result-cards, .tab-content {
    grid-template-columns: 1fr;
  }
  
  .category-filter {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 10px;
  }
}
</style> 