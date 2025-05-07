<template>
  <div class="users-page">
    <div class="page-header">
      <h1>居民用户管理</h1>
      <p class="page-description">管理平台注册的居民用户信息和回收记录</p>
    </div>
    
    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="用户名/手机号" clearable />
        </el-form-item>
        
        <el-form-item label="用户状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据统计 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ userStats.total }}</div>
          <div class="stat-label">注册用户总数</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ userStats.active }}</div>
          <div class="stat-label">活跃用户数</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ userStats.newToday }}</div>
          <div class="stat-label">今日新增</div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ userStats.recycleAvg }}</div>
          <div class="stat-label">人均回收(kg)</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 用户表格 -->
    <el-card shadow="hover" class="users-card">
      <template #header>
        <div class="card-header">
          <h3>用户列表</h3>
          <div class="header-actions">
            <el-button type="success">
              <el-icon><Download /></el-icon> 导出数据
            </el-button>
            <el-button type="primary" @click="refreshUsers">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="users"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="user-detail">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="用户ID">{{ props.row.id }}</el-descriptions-item>
                <el-descriptions-item label="注册时间">{{ props.row.registerTime }}</el-descriptions-item>
                <el-descriptions-item label="上次登录">{{ props.row.lastLogin }}</el-descriptions-item>
                <el-descriptions-item label="回收次数">{{ props.row.recycleTimes }}</el-descriptions-item>
                <el-descriptions-item label="回收总量">{{ props.row.recycleWeight }}kg</el-descriptions-item>
                <el-descriptions-item label="积分">{{ props.row.points }}</el-descriptions-item>
              </el-descriptions>
              
              <div class="detail-section">
                <h4>回收记录</h4>
                <el-table :data="props.row.records" style="width: 100%">
                  <el-table-column prop="time" label="时间" width="160" />
                  <el-table-column prop="station" label="回收站" width="150" />
                  <el-table-column prop="category" label="垃圾类型" width="100" />
                  <el-table-column prop="weight" label="重量(kg)" width="100" />
                  <el-table-column prop="points" label="获得积分" width="100" />
                </el-table>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="用户信息" min-width="220">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="40" :src="scope.row.avatar">
                {{ getNameInitial(scope.row.username) }}
              </el-avatar>
              <div class="user-text">
                <div class="username">{{ scope.row.username }}</div>
                <div class="phone">{{ scope.row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'normal' ? 'success' : 'danger'">
              {{ scope.row.status === 'normal' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              @click="viewUserDetail(scope.row)"
            >
              详情
            </el-button>
            <el-button 
              type="warning" 
              link 
              @click="toggleUserStatus(scope.row)"
            >
              {{ scope.row.status === 'normal' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="resetUserPassword(scope.row)"
            >
              重置密码
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Download, Refresh } from '@element-plus/icons-vue';
import { getUsersList } from '@/services/adminService';

// 状态与数据
const loading = ref(false);
const users = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 筛选表单
const filterForm = ref({
  keyword: '',
  status: ''
});

// 用户统计数据
const userStats = ref({
  total: 0,
  active: 0,
  newToday: 0,
  recycleAvg: 0
});

// 获取名称首字母（用于头像显示）
const getNameInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U';
};

// 加载用户列表
const loadUsers = async () => {
  loading.value = true;
  
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filterForm.value
    };
    
    const res = await getUsersList(params);
    if (res && res.code === 200) {
      users.value = res.data.list;
      total.value = res.data.total;
      userStats.value = res.data.stats;
    } else {
      throw new Error(res.message || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    // 使用模拟数据
    mockUserData();
  } finally {
    loading.value = false;
  }
};

// 模拟用户数据
const mockUserData = () => {
  // 基础用户数据
  const baseUsers = [
    {
      id: 'U10001',
      username: '张明',
      phone: '138****1234',
      email: 'zhangming@example.com',
      address: '北京市朝阳区某某小区1号楼',
      status: 'normal',
      registerTime: '2023-01-15 09:25:36',
      lastLogin: '2023-05-15 18:30:12',
      recycleTimes: 28,
      recycleWeight: 85.6,
      points: 426,
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 'U10002',
      username: '李华',
      phone: '139****5678',
      email: 'lihua@example.com',
      address: '北京市海淀区某某小区2号楼',
      status: 'normal',
      registerTime: '2023-02-20 15:40:22',
      lastLogin: '2023-05-14 10:15:08',
      recycleTimes: 16,
      recycleWeight: 45.2,
      points: 230,
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 'U10003',
      username: '王芳',
      phone: '137****9012',
      email: 'wangfang@example.com',
      address: '北京市西城区某某小区3号楼',
      status: 'disabled',
      registerTime: '2023-03-05 11:18:45',
      lastLogin: '2023-04-28 16:42:30',
      recycleTimes: 8,
      recycleWeight: 22.4,
      points: 112,
      avatar: 'https://via.placeholder.com/40'
    }
  ];
  
  // 生成回收记录
  const generateRecords = (count) => {
    const records = [];
    const categories = ['厨余垃圾', '可回收物', '有害垃圾', '其他垃圾'];
    const stations = ['1号楼垃圾站', '3号楼垃圾站', '5号楼垃圾站', '7号楼垃圾站'];
    
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      records.push({
        time: date.toLocaleString(),
        station: stations[Math.floor(Math.random() * stations.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        weight: (Math.random() * 5 + 0.5).toFixed(1),
        points: Math.floor(Math.random() * 20) + 5
      });
    }
    
    return records.sort((a, b) => new Date(b.time) - new Date(a.time));
  };
  
  // 为每个用户添加回收记录
  users.value = baseUsers.map(user => ({
    ...user,
    records: generateRecords(Math.min(user.recycleTimes, 5)) // 只显示最近5条记录
  }));
  
  // 更新统计信息
  userStats.value = {
    total: 432,
    active: 285,
    newToday: 12,
    recycleAvg: 42.5
  };
  
  total.value = baseUsers.length;
};

// 应用筛选
const applyFilter = () => {
  currentPage.value = 1;
  loadUsers();
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    keyword: '',
    status: ''
  };
  applyFilter();
};

// 刷新用户列表
const refreshUsers = () => {
  loadUsers();
  ElMessage.success('用户列表已刷新');
};

// 查看用户详情
const viewUserDetail = (user) => {
  ElMessage.info(`查看用户 ${user.username} 的详情`);
};

// 切换用户状态
const toggleUserStatus = (user) => {
  const action = user.status === 'normal' ? '禁用' : '启用';
  
  ElMessageBox.confirm(
    `确定要${action}用户 ${user.username} 吗？`,
    `${action}用户`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: user.status === 'normal' ? 'warning' : 'info'
    }
  )
    .then(() => {
      // 实际项目中应调用API
      user.status = user.status === 'normal' ? 'disabled' : 'normal';
      ElMessage.success(`已${action}用户 ${user.username}`);
    })
    .catch(() => {});
};

// 重置用户密码
const resetUserPassword = (user) => {
  ElMessageBox.confirm(
    `确定要重置用户 ${user.username} 的密码吗？`,
    '重置密码',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 实际项目中应调用API
      ElMessage.success(`已重置用户 ${user.username} 的密码`);
    })
    .catch(() => {});
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadUsers();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadUsers();
};

// 初始化
onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.users-page {
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

.users-card {
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

.user-info {
  display: flex;
  align-items: center;
}

.user-text {
  margin-left: 10px;
}

.username {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.phone {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.user-detail {
  padding: 10px;
}

.detail-section {
  margin-top: 15px;
}

.detail-section h4 {
  font-size: 14px;
  margin: 0 0 10px 0;
  color: #606266;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
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