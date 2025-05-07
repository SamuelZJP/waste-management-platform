<template>
  <div class="user-detail-container">
    <el-card class="header-card">
      <div class="header-content">
        <div class="back-button">
          <el-button type="primary" plain @click="router.back()">
            <el-icon><ArrowLeft /></el-icon> 返回
          </el-button>
        </div>
        <div class="page-title">
          <h2>用户详情</h2>
          <p>查看用户详细信息及回收记录</p>
        </div>
      </div>
    </el-card>

    <el-skeleton :loading="loading" animated>
      <template #template>
        <div style="padding: 20px">
          <el-skeleton-item variant="image" style="width: 100%; height: 160px" />
          <div style="padding: 14px">
            <el-skeleton-item variant="h3" style="width: 50%" />
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 16px">
              <el-skeleton-item variant="text" style="margin-right: 16px; width: 30%" />
              <el-skeleton-item variant="text" style="width: 30%" />
            </div>
            <el-skeleton-item variant="text" style="width: 100%; margin-top: 16px" />
          </div>
        </div>
      </template>

      <template #default>
        <div v-if="!userInfo" class="error-message">
          <el-empty description="用户信息不存在或已被删除">
            <el-button type="primary" @click="router.push('/admin/users')">返回用户列表</el-button>
          </el-empty>
        </div>

        <div v-else class="user-detail-content">
          <!-- 用户基本信息卡片 -->
          <el-card class="user-info-card">
            <template #header>
              <div class="card-header">
                <span>用户基本信息</span>
                <div>
                  <el-button type="primary" size="small" @click="handleEdit">
                    <el-icon><Edit /></el-icon> 编辑信息
                  </el-button>
                  <el-button 
                    :type="userInfo.status === 'normal' ? 'danger' : 'success'" 
                    size="small" 
                    @click="handleToggleStatus"
                  >
                    <el-icon><CircleClose v-if="userInfo.status === 'normal'" /></el-icon>
                    <el-icon><Check v-else /></el-icon>
                    {{ userInfo.status === 'normal' ? '禁用账号' : '启用账号' }}
                  </el-button>
                </div>
              </div>
            </template>

            <div class="user-info-content">
              <div class="user-avatar">
                <el-avatar :size="80" :src="userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                <div class="user-status">
                  <el-tag 
                    :type="userInfo.status === 'normal' ? 'success' : 'danger'"
                  >
                    {{ userInfo.status === 'normal' ? '正常' : '已禁用' }}
                  </el-tag>
                </div>
              </div>

              <div class="user-details">
                <div class="detail-item">
                  <span class="label">用户ID:</span>
                  <span class="value">{{ userInfo.id }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">用户名:</span>
                  <span class="value">{{ userInfo.username }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">联系电话:</span>
                  <span class="value">{{ userInfo.phone }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">电子邮箱:</span>
                  <span class="value">{{ userInfo.email }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">家庭住址:</span>
                  <span class="value">{{ userInfo.address }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">注册时间:</span>
                  <span class="value">{{ userInfo.registerTime }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">最近登录:</span>
                  <span class="value">{{ userInfo.lastLogin }}</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 用户回收统计卡片 -->
          <el-card class="recycle-stats-card">
            <template #header>
              <div class="card-header">
                <span>回收统计</span>
                <el-button type="primary" size="small" plain @click="handleExportData">
                  <el-icon><Download /></el-icon> 导出数据
                </el-button>
              </div>
            </template>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.recycleTimes || 0 }}</div>
                <div class="stat-label">回收次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.recycleWeight || 0 }} kg</div>
                <div class="stat-label">回收总重量</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.points || 0 }}</div>
                <div class="stat-label">积分总数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.recycleTimes ? (userInfo.recycleWeight / userInfo.recycleTimes).toFixed(1) : 0 }} kg</div>
                <div class="stat-label">平均每次重量</div>
              </div>
            </div>
          </el-card>

          <!-- 回收记录列表 -->
          <el-card class="recycle-records-card">
            <template #header>
              <div class="card-header">
                <span>回收记录列表</span>
                <div>
                  <el-select v-model="filterCategory" placeholder="垃圾类型" clearable style="width: 140px; margin-right: 10px">
                    <el-option label="厨余垃圾" value="厨余垃圾" />
                    <el-option label="可回收物" value="可回收物" />
                    <el-option label="有害垃圾" value="有害垃圾" />
                    <el-option label="其他垃圾" value="其他垃圾" />
                  </el-select>
                  <el-date-picker
                    v-model="dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    style="width: 300px; margin-right: 10px"
                  />
                  <el-button type="primary" @click="handleFilter">筛选</el-button>
                  <el-button @click="resetFilter">重置</el-button>
                </div>
              </div>
            </template>

            <el-table :data="userRecords" border style="width: 100%" v-loading="recordsLoading">
              <el-table-column prop="time" label="回收时间" min-width="180" />
              <el-table-column prop="station" label="回收站点" min-width="180" />
              <el-table-column prop="category" label="垃圾类型" min-width="120">
                <template #default="{ row }">
                  <el-tag
                    :type="getCategoryTagType(row.category)"
                    effect="plain"
                  >
                    {{ row.category }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="weight" label="重量(kg)" min-width="120" />
              <el-table-column prop="points" label="获得积分" min-width="120" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click="viewRecordDetail(row)">查看详情</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-container">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalRecords"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </div>
      </template>
    </el-skeleton>

    <!-- 编辑用户信息对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑用户信息" width="500px">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="家庭住址" prop="address">
          <el-input v-model="editForm.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 记录详情对话框 -->
    <el-dialog v-model="recordDetailVisible" title="回收记录详情" width="600px">
      <div v-if="selectedRecord">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="回收时间">{{ selectedRecord.time }}</el-descriptions-item>
          <el-descriptions-item label="回收站点">{{ selectedRecord.station }}</el-descriptions-item>
          <el-descriptions-item label="垃圾类型">
            <el-tag :type="getCategoryTagType(selectedRecord.category)" effect="plain">
              {{ selectedRecord.category }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="重量">{{ selectedRecord.weight }} kg</el-descriptions-item>
          <el-descriptions-item label="获得积分">{{ selectedRecord.points }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  ArrowLeft, 
  Edit, 
  CircleClose, 
  Check, 
  Download 
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const userId = route.params.id;

// 状态变量
const loading = ref(true);
const recordsLoading = ref(false);
const userInfo = ref(null);
const userRecords = ref([]);
const editDialogVisible = ref(false);
const recordDetailVisible = ref(false);
const selectedRecord = ref(null);
const editForm = ref({});
const editFormRef = ref(null);
const filterCategory = ref('');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

// 获取用户信息和记录
onMounted(async () => {
  await getUserInfo();
  await getUserRecords();
});

// 获取用户信息
const getUserInfo = async () => {
  loading.value = true;
  try {
    // 这里应该使用实际的API调用
    // 示例使用模拟数据
    setTimeout(() => {
      userInfo.value = {
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
        avatar: 'https://via.placeholder.com/80'
      };
      loading.value = false;
    }, 800);
  } catch (error) {
    console.error('获取用户信息失败', error);
    ElMessage.error('获取用户信息失败');
    loading.value = false;
  }
};

// 获取用户回收记录
const getUserRecords = async () => {
  recordsLoading.value = true;
  try {
    // 这里应该使用实际的API调用
    // 示例使用模拟数据
    setTimeout(() => {
      const mockRecords = [
        {
          id: 'R1001',
          time: '2023-05-14 10:15:30',
          station: '1号楼垃圾站',
          category: '厨余垃圾',
          weight: '2.3',
          points: 12
        },
        {
          id: 'R1002',
          time: '2023-05-10 16:20:45',
          station: '3号楼垃圾站',
          category: '可回收物',
          weight: '1.5',
          points: 15
        },
        {
          id: 'R1003',
          time: '2023-05-01 14:30:15',
          station: '7号楼垃圾站',
          category: '其他垃圾',
          weight: '3.2',
          points: 8
        },
        {
          id: 'R1004',
          time: '2023-04-25 09:10:20',
          station: '5号楼垃圾站',
          category: '有害垃圾',
          weight: '0.8',
          points: 18
        },
        {
          id: 'R1005',
          time: '2023-04-20 11:05:40',
          station: '2号楼垃圾站',
          category: '厨余垃圾',
          weight: '1.9',
          points: 10
        },
      ];
      
      userRecords.value = mockRecords;
      totalRecords.value = mockRecords.length;
      recordsLoading.value = false;
    }, 500);
  } catch (error) {
    console.error('获取回收记录失败', error);
    ElMessage.error('获取回收记录失败');
    recordsLoading.value = false;
  }
};

// 获取垃圾类型标签样式
const getCategoryTagType = (category) => {
  const map = {
    '厨余垃圾': 'success',
    '可回收物': 'primary',
    '有害垃圾': 'danger',
    '其他垃圾': 'info'
  };
  return map[category] || 'info';
};

// 查看记录详情
const viewRecordDetail = (record) => {
  selectedRecord.value = record;
  recordDetailVisible.value = true;
};

// 处理编辑用户信息
const handleEdit = () => {
  editForm.value = { ...userInfo.value };
  editDialogVisible.value = true;
};

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return;
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      // 这里应该使用实际的API调用
      // 示例使用模拟数据
      setTimeout(() => {
        userInfo.value = { ...userInfo.value, ...editForm.value };
        editDialogVisible.value = false;
        ElMessage.success('用户信息更新成功');
      }, 300);
    }
  });
};

// 处理禁用/启用账号
const handleToggleStatus = () => {
  const action = userInfo.value.status === 'normal' ? '禁用' : '启用';
  
  ElMessageBox.confirm(
    `确定要${action}该用户账号吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 这里应该使用实际的API调用
    // 示例使用模拟数据
    setTimeout(() => {
      userInfo.value.status = userInfo.value.status === 'normal' ? 'disabled' : 'normal';
      ElMessage.success(`账号${action}成功`);
    }, 300);
  }).catch(() => {});
};

// 导出数据
const handleExportData = () => {
  ElMessage.success('数据导出功能已触发，实际导出功能需要后端支持');
};

// 筛选记录
const handleFilter = () => {
  ElMessage.info('筛选功能已触发，实际筛选需要后端支持');
  // 在实际应用中，这里应该调用API并传递筛选参数
};

// 重置筛选
const resetFilter = () => {
  filterCategory.value = '';
  dateRange.value = [];
  handleFilter();
};

// 处理页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val;
  getUserRecords();
};

// 处理每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val;
  getUserRecords();
};
</script>

<style scoped>
.user-detail-container {
  padding: 20px;
}

.header-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
}

.back-button {
  margin-right: 20px;
}

.page-title {
  flex: 1;
}

.page-title h2 {
  margin: 0 0 5px 0;
  font-weight: 600;
}

.page-title p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.user-detail-content > * {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info-content {
  display: flex;
  flex-wrap: wrap;
}

.user-avatar {
  margin-right: 30px;
  text-align: center;
}

.user-status {
  margin-top: 10px;
}

.user-details {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  min-width: 80px;
}

.value {
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background-color: #f6f8fa;
  border-radius: 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #409EFF;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.error-message {
  padding: 40px 0;
}

@media (max-width: 768px) {
  .user-details {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header > div {
    margin-top: 10px;
  }
}
</style> 