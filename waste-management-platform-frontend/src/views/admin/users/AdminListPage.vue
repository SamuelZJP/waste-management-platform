<template>
  <div class="admin-users-page">
    <div class="page-header">
      <h1>管理员用户管理</h1>
      <p class="page-description">管理系统管理员账户信息和权限</p>
    </div>
    
    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="管理员名称/手机号" clearable />
        </el-form-item>
        
        <el-form-item label="角色">
          <el-select v-model="filterForm.role" placeholder="选择角色" clearable>
            <el-option label="超级管理员" value="super" />
            <el-option label="回收站管理员" value="station" />
            <el-option label="系统运维" value="operation" />
            <el-option label="客服专员" value="service" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="applyFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 管理员列表 -->
    <el-card shadow="hover" class="admins-card">
      <template #header>
        <div class="card-header">
          <h3>管理员列表</h3>
          <div class="header-actions">
            <el-button type="success" @click="addAdmin">
              <el-icon><Plus /></el-icon> 添加管理员
            </el-button>
            <el-button type="primary" @click="refreshAdmins">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table
        :data="admins"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column label="管理员信息" min-width="220">
          <template #default="scope">
            <div class="admin-info">
              <el-avatar :size="40" :src="scope.row.avatar">
                {{ getNameInitial(scope.row.name) }}
              </el-avatar>
              <div class="admin-text">
                <div class="admin-name">{{ scope.row.name }}</div>
                <div class="admin-role">{{ getRoleLabel(scope.row.role) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="phone" label="联系电话" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        
        <el-table-column prop="station" label="管理区域" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.station || '全部区域' }}
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column prop="lastLogin" label="上次登录" min-width="180" />
        
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              @click="editAdmin(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              type="success" 
              link 
              @click="setPermission(scope.row)"
            >
              权限
            </el-button>
            <el-button 
              type="warning" 
              link 
              @click="toggleAdminStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="resetAdminPassword(scope.row)"
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
    
    <!-- 添加/编辑管理员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑管理员' : '添加管理员'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="adminFormRef"
        :model="adminForm"
        :rules="adminRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="adminForm.name" placeholder="请输入管理员姓名" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="adminForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="adminForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="adminForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="super" />
            <el-option label="回收站管理员" value="station" />
            <el-option label="系统运维" value="operation" />
            <el-option label="客服专员" value="service" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="管理区域" prop="station" v-if="adminForm.role === 'station'">
          <el-select v-model="adminForm.station" placeholder="请选择管理区域" style="width: 100%">
            <el-option 
              v-for="station in stations" 
              :key="station.id" 
              :label="station.name" 
              :value="station.id" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="adminForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input v-model="adminForm.confirmPassword" type="password" placeholder="请确认密码" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdminForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 设置权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="设置权限"
      width="600px"
      destroy-on-close
    >
      <div v-if="selectedAdmin" class="permission-dialog">
        <div class="admin-header">
          <el-avatar :size="50" :src="selectedAdmin.avatar">
            {{ getNameInitial(selectedAdmin.name) }}
          </el-avatar>
          <div class="admin-info">
            <div class="admin-name">{{ selectedAdmin.name }}</div>
            <div class="admin-role">{{ getRoleLabel(selectedAdmin.role) }}</div>
          </div>
        </div>
        
        <div class="permission-content">
          <div class="permission-group" v-for="(group, index) in permissionGroups" :key="index">
            <div class="group-title">{{ group.title }}</div>
            <div class="permission-items">
              <el-checkbox
                v-for="item in group.permissions"
                :key="item.id"
                v-model="permissionForm[item.id]"
                :disabled="item.isFixed"
              >
                {{ item.name }}
              </el-checkbox>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermissions">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh } from '@element-plus/icons-vue';
import { getAdminsList } from '@/services/adminService';

// 状态与数据
const loading = ref(false);
const admins = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const dialogVisible = ref(false);
const isEdit = ref(false);
const adminFormRef = ref(null);
const permissionDialogVisible = ref(false);
const selectedAdmin = ref(null);

// 筛选表单
const filterForm = ref({
  keyword: '',
  role: ''
});

// 管理员表单
const adminForm = ref({
  id: '',
  name: '',
  phone: '',
  email: '',
  role: '',
  station: '',
  password: '',
  confirmPassword: ''
});

// 表单验证规则
const adminRules = {
  name: [
    { required: true, message: '请输入管理员姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== adminForm.value.password) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 权限表单
const permissionForm = ref({});

// 权限组
const permissionGroups = [
  {
    title: '用户管理',
    permissions: [
      { id: 'user_view', name: '查看用户', isFixed: true },
      { id: 'user_edit', name: '编辑用户', isFixed: false },
      { id: 'user_delete', name: '删除用户', isFixed: false }
    ]
  },
  {
    title: '垃圾站管理',
    permissions: [
      { id: 'station_view', name: '查看垃圾站', isFixed: true },
      { id: 'station_edit', name: '编辑垃圾站', isFixed: false },
      { id: 'station_device', name: '设备管理', isFixed: false },
      { id: 'station_report', name: '报表查看', isFixed: false }
    ]
  },
  {
    title: '系统设置',
    permissions: [
      { id: 'system_config', name: '系统配置', isFixed: false },
      { id: 'admin_manage', name: '管理员管理', isFixed: false }
    ]
  }
];

// 垃圾站列表
const stations = [
  { id: '1', name: '1号楼垃圾站' },
  { id: '2', name: '3号楼垃圾站' },
  { id: '3', name: '5号楼垃圾站' },
  { id: '4', name: '7号楼垃圾站' },
  { id: '5', name: '9号楼垃圾站' },
  { id: '6', name: '11号楼垃圾站' }
];

// 获取名称首字母（用于头像显示）
const getNameInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'A';
};

// 获取角色显示标签
const getRoleLabel = (role) => {
  switch (role) {
    case 'super': return '超级管理员';
    case 'station': return '回收站管理员';
    case 'operation': return '系统运维';
    case 'service': return '客服专员';
    default: return '未知角色';
  }
};

// 加载管理员列表
const loadAdmins = async () => {
  loading.value = true;
  
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filterForm.value
    };
    
    const res = await getAdminsList(params);
    if (res && res.code === 200) {
      admins.value = res.data.list;
      total.value = res.data.total;
    } else {
      throw new Error(res.message || '获取管理员列表失败');
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    // 使用模拟数据
    mockAdminData();
  } finally {
    loading.value = false;
  }
};

// 模拟管理员数据
const mockAdminData = () => {
  const mockAdmins = [
    {
      id: 'A10001',
      name: '张三',
      phone: '13800138001',
      email: 'zhangsan@example.com',
      role: 'super',
      station: '',
      status: 'active',
      createTime: '2022-01-10 10:00:00',
      lastLogin: '2023-05-15 08:30:15',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 'A10002',
      name: '李四',
      phone: '13800138002',
      email: 'lisi@example.com',
      role: 'station',
      station: '1号楼垃圾站',
      status: 'active',
      createTime: '2022-02-15 14:20:00',
      lastLogin: '2023-05-14 16:45:22',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 'A10003',
      name: '王五',
      phone: '13800138003',
      email: 'wangwu@example.com',
      role: 'operation',
      station: '',
      status: 'disabled',
      createTime: '2022-03-20 09:15:00',
      lastLogin: '2023-04-30 11:20:05',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      id: 'A10004',
      name: '赵六',
      phone: '13800138004',
      email: 'zhaoliu@example.com',
      role: 'service',
      station: '',
      status: 'active',
      createTime: '2022-04-05 16:30:00',
      lastLogin: '2023-05-15 09:10:33',
      avatar: 'https://via.placeholder.com/40'
    }
  ];
  
  admins.value = mockAdmins;
  total.value = mockAdmins.length;
};

// 应用筛选
const applyFilter = () => {
  currentPage.value = 1;
  loadAdmins();
};

// 重置筛选
const resetFilter = () => {
  filterForm.value = {
    keyword: '',
    role: ''
  };
  applyFilter();
};

// 刷新管理员列表
const refreshAdmins = () => {
  loadAdmins();
  ElMessage.success('管理员列表已刷新');
};

// 添加管理员
const addAdmin = () => {
  isEdit.value = false;
  adminForm.value = {
    id: '',
    name: '',
    phone: '',
    email: '',
    role: '',
    station: '',
    password: '',
    confirmPassword: ''
  };
  dialogVisible.value = true;
};

// 编辑管理员
const editAdmin = (admin) => {
  isEdit.value = true;
  adminForm.value = {
    id: admin.id,
    name: admin.name,
    phone: admin.phone,
    email: admin.email,
    role: admin.role,
    station: admin.station,
    password: '',
    confirmPassword: ''
  };
  dialogVisible.value = true;
};

// 提交管理员表单
const submitAdminForm = async () => {
  if (!adminFormRef.value) return;
  
  await adminFormRef.value.validate((valid) => {
    if (valid) {
      // 实际项目中应调用API
      dialogVisible.value = false;
      
      ElMessage.success(isEdit.value ? '管理员信息已更新' : '管理员已添加');
      loadAdmins();
    }
  });
};

// 切换管理员状态
const toggleAdminStatus = (admin) => {
  const action = admin.status === 'active' ? '禁用' : '启用';
  
  ElMessageBox.confirm(
    `确定要${action}管理员 ${admin.name} 吗？`,
    `${action}管理员`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: admin.status === 'active' ? 'warning' : 'info'
    }
  )
    .then(() => {
      // 实际项目中应调用API
      admin.status = admin.status === 'active' ? 'disabled' : 'active';
      ElMessage.success(`已${action}管理员 ${admin.name}`);
    })
    .catch(() => {});
};

// 重置管理员密码
const resetAdminPassword = (admin) => {
  ElMessageBox.confirm(
    `确定要重置管理员 ${admin.name} 的密码吗？`,
    '重置密码',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 实际项目中应调用API
      ElMessage.success(`已重置管理员 ${admin.name} 的密码`);
    })
    .catch(() => {});
};

// 设置权限
const setPermission = (admin) => {
  selectedAdmin.value = admin;
  
  // 重置权限表单
  const permissions = {};
  
  // 模拟已有权限
  if (admin.role === 'super') {
    // 超级管理员拥有所有权限
    permissionGroups.forEach(group => {
      group.permissions.forEach(permission => {
        permissions[permission.id] = true;
      });
    });
  } else if (admin.role === 'station') {
    // 回收站管理员拥有部分权限
    permissions.user_view = true;
    permissions.station_view = true;
    permissions.station_device = true;
    permissions.station_report = true;
  } else if (admin.role === 'operation') {
    // 系统运维拥有部分权限
    permissions.station_view = true;
    permissions.station_edit = true;
    permissions.station_device = true;
    permissions.system_config = true;
  } else if (admin.role === 'service') {
    // 客服专员拥有部分权限
    permissions.user_view = true;
    permissions.user_edit = true;
    permissions.station_view = true;
  }
  
  permissionForm.value = permissions;
  permissionDialogVisible.value = true;
};

// 保存权限
const savePermissions = () => {
  // 实际项目中应调用API
  ElMessage.success(`已更新管理员 ${selectedAdmin.value.name} 的权限`);
  permissionDialogVisible.value = false;
};

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val;
  loadAdmins();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadAdmins();
};

// 初始化
onMounted(() => {
  loadAdmins();
});
</script>

<style scoped>
.admin-users-page {
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

.admins-card {
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

.admin-info {
  display: flex;
  align-items: center;
}

.admin-text {
  margin-left: 10px;
}

.admin-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.admin-role {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 权限对话框样式 */
.permission-dialog {
  padding: 10px;
}

.admin-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.admin-header .admin-info {
  margin-left: 15px;
}

.permission-content {
  margin-top: 15px;
}

.permission-group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.permission-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
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
  
  .permission-items {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 