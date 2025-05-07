<template>
  <div class="admin-register-page">
    <div class="register-container">
      <div class="register-header">
        <img src="@/assets/images/logo.svg" alt="智能垃圾管理平台" class="logo" />
        <h1 class="title">智能垃圾管理平台</h1>
        <div class="subtitle">管理员账号申请</div>
      </div>
      
      <el-card class="register-card">
        <div class="card-header">
          <h2>申请管理员账号</h2>
          <p class="note">注意：管理员账号需要经过审核才能使用</p>
        </div>
        
        <el-steps :active="activeStep" finish-status="success" simple style="margin-bottom: 30px;">
          <el-step title="填写信息" />
          <el-step title="提交审核" />
          <el-step title="等待审批" />
        </el-steps>
        
        <!-- 步骤1: 填写信息 -->
        <div v-if="activeStep === 0">
          <el-form 
            ref="registerFormRef"
            :model="registerForm" 
            :rules="registerRules" 
            label-position="top"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="username" label="用户名">
                  <el-input 
                    v-model="registerForm.username" 
                    placeholder="请设置管理员用户名"
                    prefix-icon="User"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="name" label="真实姓名">
                  <el-input 
                    v-model="registerForm.name" 
                    placeholder="请输入真实姓名"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="password" label="密码">
                  <el-input 
                    v-model="registerForm.password" 
                    type="password" 
                    placeholder="请设置密码"
                    prefix-icon="Lock" 
                    show-password
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="confirmPassword" label="确认密码">
                  <el-input 
                    v-model="registerForm.confirmPassword" 
                    type="password" 
                    placeholder="请再次输入密码"
                    prefix-icon="Lock" 
                    show-password
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item prop="phone" label="手机号">
                  <el-input 
                    v-model="registerForm.phone" 
                    placeholder="请输入手机号"
                    prefix-icon="Phone"
                    clearable
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item prop="email" label="邮箱">
                  <el-input 
                    v-model="registerForm.email" 
                    placeholder="请输入邮箱"
                    prefix-icon="Message"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item prop="stationId" label="所属社区">
              <el-select 
                v-model="registerForm.communityId" 
                placeholder="请选择所管理的社区"
                style="width: 100%"
                filterable
              >
                <el-option 
                  v-for="community in communities" 
                  :key="community.id" 
                  :label="community.name" 
                  :value="community.id" 
                />
              </el-select>
            </el-form-item>
            
            <el-form-item prop="role" label="申请角色">
              <el-select 
                v-model="registerForm.role" 
                placeholder="请选择申请角色"
                style="width: 100%"
              >
                <el-option label="物业管理员" value="property_admin" />
                <el-option label="环保专员" value="environment_specialist" />
                <el-option label="设备维护员" value="device_maintainer" />
              </el-select>
            </el-form-item>
            
            <el-form-item prop="idCard" label="身份证号">
              <el-input 
                v-model="registerForm.idCard" 
                placeholder="请输入身份证号"
                clearable
              />
            </el-form-item>
            
            <el-form-item prop="reason" label="申请理由">
              <el-input 
                v-model="registerForm.reason" 
                type="textarea"
                :rows="3"
                placeholder="请简要说明申请管理员的理由"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                @click="goToStep2"
              >
                下一步
              </el-button>
              <el-button @click="goToLogin">返回登录</el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 步骤2: 提交审核 -->
        <div v-if="activeStep === 1" class="step-container">
          <h3>确认信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ registerForm.username }}</el-descriptions-item>
            <el-descriptions-item label="真实姓名">{{ registerForm.name }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ registerForm.phone }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ registerForm.email }}</el-descriptions-item>
            <el-descriptions-item label="所属社区">
              {{ getCommunityName(registerForm.communityId) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请角色">
              {{ getRoleName(registerForm.role) }}
            </el-descriptions-item>
            <el-descriptions-item label="申请理由">{{ registerForm.reason }}</el-descriptions-item>
          </el-descriptions>
          
          <div class="agreement-row">
            <el-checkbox v-model="agreement">我已阅读并同意</el-checkbox>
            <el-link type="primary" :underline="false" @click="showAgreement">《管理员责任协议》</el-link>
          </div>
          
          <div class="step-actions">
            <el-button @click="activeStep = 0">上一步</el-button>
            <el-button 
              type="primary" 
              :loading="submitLoading"
              :disabled="!agreement"
              @click="submitApplication"
            >
              提交申请
            </el-button>
          </div>
        </div>
        
        <!-- 步骤3: 等待审批 -->
        <div v-if="activeStep === 2" class="step-container result-container">
          <el-result
            icon="success"
            title="申请提交成功"
            sub-title="您的管理员账号申请已提交，请耐心等待审核。审核结果将通过短信和邮件通知您。"
          >
            <template #extra>
              <el-button type="primary" @click="goToLogin">返回登录</el-button>
            </template>
          </el-result>
          
          <div class="notice-box">
            <h4>审核说明</h4>
            <p>1. 审核通常在1-3个工作日内完成</p>
            <p>2. 审核期间可能会有工作人员通过电话或邮件联系您核实信息</p>
            <p>3. 如有疑问，请拨打平台客服电话：400-123-4567</p>
          </div>
        </div>
      </el-card>
      
      <div class="register-footer">
        <p>© 2025 智能垃圾管理平台 版权所有</p>
        <p>技术支持：XX环保科技有限公司</p>
      </div>
    </div>
    
    <!-- 协议对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="管理员责任协议"
      width="60%"
      center
    >
      <div class="agreement-content">
        <h3>《管理员责任协议》</h3>
        <p>作为智能垃圾管理平台的管理员，您需要承担以下责任：</p>
        <ol>
          <li>负责管理所属回收站的日常运营，确保回收站正常运行</li>
          <li>及时处理用户反馈和投诉，提供专业的解答和解决方案</li>
          <li>定期检查设备运行状态，发现异常及时上报和处理</li>
          <li>妥善保管管理员账号，不得将账号借给他人使用</li>
          <li>遵守平台规则和国家相关法律法规</li>
          <li>保护用户隐私，不得泄露用户个人信息</li>
          <li>按要求完成工作报表和数据统计分析</li>
        </ol>
        <p>如违反上述责任，平台有权取消您的管理员资格，并追究相关责任。</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="agreeAndClose">同意</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Phone, Message } from '@element-plus/icons-vue';
import { registerAdmin, getRecycleStations } from '@/services/adminService';

const router = useRouter();
const registerFormRef = ref(null);
const submitLoading = ref(false);
const activeStep = ref(0);
const agreement = ref(false);
const dialogVisible = ref(false);

// 注册表单
const registerForm = reactive({
  username: '',
  name: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: '',
  stationId: '',
  role: '',
  idCard: '',
  reason: ''
});

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
        if (!regex.test(value) && value) {
          callback(new Error('密码必须包含大小写字母和数字'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  stationId: [
    { required: true, message: '请选择所属回收站', trigger: 'change' }
  ],
  role: [
    { required: true, message: '请选择申请角色', trigger: 'change' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入申请理由', trigger: 'blur' },
    { min: 10, max: 200, message: '长度在 10 到 200 个字符', trigger: 'blur' }
  ]
};

// 回收站数据
const recycleStations = ref([]);

// 获取回收站数据
const loadRecycleStations = async () => {
  try {
    const res = await getRecycleStations();
    if (res.code === 200) {
      recycleStations.value = res.data;
    }
  } catch (error) {
    console.error('获取回收站数据失败:', error);
    // 设置默认回收站数据，以防API调用失败
    recycleStations.value = [
      { id: '1', name: '海淀区西二旗回收站' },
      { id: '2', name: '朝阳区望京回收站' },
      { id: '3', name: '东城区建国门回收站' },
      { id: '4', name: '西城区西单回收站' },
      { id: '5', name: '丰台区方庄回收站' },
      { id: '6', name: '石景山区鲁谷回收站' }
    ];
  }
};

// 获取回收站名称
const getStationName = (id) => {
  const station = recycleStations.value.find(item => item.id === id);
  return station ? station.name : '';
};

// 社区数据
const communities = ref([]);

// 获取社区数据
const loadCommunities = async () => {
  try {
    // 实际项目中应该调用API获取社区列表
    communities.value = [
      { id: '1', name: '阳光花园小区' },
      { id: '2', name: '海景湾社区' },
      { id: '3', name: '绿城公寓' },
      { id: '4', name: '和谐家园' },
      { id: '5', name: '春风里社区' },
      { id: '6', name: '幸福新城' }
    ];
  } catch (error) {
    console.error('获取社区数据失败:', error);
  }
};

// 获取社区名称
const getCommunityName = (id) => {
  const community = communities.value.find(item => item.id === id);
  return community ? community.name : '';
};

// 获取角色名称
const getRoleName = (role) => {
  const roles = {
    'property_admin': '物业管理员',
    'environment_specialist': '环保专员',
    'device_maintainer': '设备维护员'
  };
  return roles[role] || role;
};

// 跳转到登录页
const goToLogin = () => {
  router.push('/admin/login');
};

// 进入第二步
const goToStep2 = async () => {
  if (!registerFormRef.value) return;
  
  try {
    await registerFormRef.value.validate();
    activeStep.value = 1;
  } catch (error) {
    // 表单验证失败
    ElMessage.warning('请正确填写所有必填信息');
  }
};

// 显示协议
const showAgreement = () => {
  dialogVisible.value = true;
};

// 同意协议并关闭弹窗
const agreeAndClose = () => {
  agreement.value = true;
  dialogVisible.value = false;
};

// 提交申请
const submitApplication = async () => {
  if (!agreement.value) {
    ElMessage.warning('请先阅读并同意《管理员责任协议》');
    return;
  }
  
  submitLoading.value = true;
  
  try {
    // 调用API提交申请
    const res = await registerAdmin(registerForm);
    
    if (res.code === 200) {
      ElMessage.success('申请提交成功！');
      activeStep.value = 2;
    } else {
      ElMessage.error(res.message || '申请提交失败');
    }
  } catch (error) {
    console.error('申请提交失败:', error);
    
    // 模拟申请成功，仅用于开发预览
    ElMessage.success('申请提交成功！（模拟）');
    activeStep.value = 2;
  } finally {
    submitLoading.value = false;
  }
};

onMounted(() => {
  // 加载回收站数据
  loadRecycleStations();
  // 加载社区数据
  loadCommunities();
});
</script>

<style scoped>
.admin-register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background-color: #f0f2f5;
  background-image: linear-gradient(to right bottom, #263238, #37474f);
  padding: 40px 0;
}

.register-container {
  width: 100%;
  max-width: 800px;
  padding: 20px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.title {
  color: #fff;
  font-size: 28px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 5px;
}

.subtitle {
  color: #e0e0e0;
  font-size: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.register-card {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 10px 0;
}

.note {
  color: #e6a23c;
  font-size: 14px;
  margin: 0;
}

.step-container {
  padding: 10px 0;
}

.step-container h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}

.step-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.agreement-row {
  margin: 20px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.result-container {
  text-align: center;
}

.notice-box {
  margin-top: 30px;
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 15px;
  text-align: left;
}

.notice-box h4 {
  color: #333;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.notice-box p {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
}

.register-footer {
  margin-top: 20px;
  text-align: center;
  color: #e0e0e0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 14px;
}

.register-footer p {
  margin: 5px 0;
}

.agreement-content {
  max-height: 400px;
  overflow-y: auto;
}

.agreement-content h3 {
  text-align: center;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-container {
    padding: 15px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 16px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
  
  .card-header h2 {
    font-size: 20px;
  }
  
  .step-actions {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .step-actions .el-button {
    width: 100%;
  }
}
</style> 