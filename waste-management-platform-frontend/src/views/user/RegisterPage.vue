<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <img src="@/assets/images/logo.svg" alt="智能垃圾管理平台" class="logo" />
        <h1 class="title">智能垃圾管理平台</h1>
      </div>
      
      <el-card class="register-card">
        <div class="card-header">
          <h2>用户注册</h2>
          <p class="subtitle">加入我们，共建绿色环保社区</p>
        </div>
        
        <el-form 
          ref="registerFormRef"
          :model="registerForm" 
          :rules="registerRules" 
          label-position="top"
          @keyup.enter="handleRegister"
        >
          <el-form-item prop="username" label="用户名">
            <el-input 
              v-model="registerForm.username" 
              placeholder="请设置用户名"
              prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password" label="密码">
            <el-input 
              v-model="registerForm.password" 
              type="password" 
              placeholder="请设置密码"
              prefix-icon="Lock" 
              show-password
              clearable
            />
            <div class="password-strength" v-if="registerForm.password">
              <div class="strength-title">密码强度: <span :class="strengthClass">{{ strengthText }}</span></div>
              <div class="strength-bar">
                <div class="strength-indicator" :style="{ width: strengthPercentage, backgroundColor: strengthColor }"></div>
              </div>
            </div>
          </el-form-item>
          
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
          
          <el-form-item prop="phone" label="手机号">
            <el-input 
              v-model="registerForm.phone" 
              placeholder="请输入手机号"
              prefix-icon="Phone"
              clearable
            >
              <template #append>
                <el-button @click="sendVerificationCode" :disabled="isCountingDown">
                  {{ countDownText }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="verificationCode" label="验证码">
            <el-input 
              v-model="registerForm.verificationCode" 
              placeholder="请输入验证码"
              maxlength="6"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="email" label="邮箱">
            <el-input 
              v-model="registerForm.email" 
              placeholder="请输入邮箱"
              prefix-icon="Message"
              clearable
            />
          </el-form-item>
          
          <el-form-item>
            <div class="agreement-row">
              <el-checkbox v-model="registerForm.agreement">我已阅读并同意</el-checkbox>
              <el-link type="primary" :underline="false" @click="showAgreement">《用户协议》</el-link>
              <span class="and-text">和</span>
              <el-link type="primary" :underline="false" @click="showPrivacy">《隐私政策》</el-link>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="register-button" 
              :loading="registerLoading"
              :disabled="!registerForm.agreement"
              @click="handleRegister"
            >
              注册
            </el-button>
          </el-form-item>
          
          <div class="login-link">
            已有账号？<el-link type="primary" :underline="false" @click="goToLogin">立即登录</el-link>
          </div>
        </el-form>
      </el-card>
      
      <div class="register-footer">
        <p>© 2025 智能垃圾管理平台 版权所有</p>
      </div>
    </div>
    
    <!-- 协议对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
      center
    >
      <div class="agreement-content">
        <p v-if="dialogType === 'agreement'">
          《用户协议》内容...
          <br><br>
          1. 用户应当遵守国家法律法规和平台规则，不得利用本平台进行任何违法活动。
          <br><br>
          2. 用户应当提供真实、准确的个人信息，并对账号安全负责。
          <br><br>
          3. 用户在平台上发布的内容不得侵犯他人合法权益，不得包含违法、侮辱、诽谤等信息。
          <br><br>
          4. 平台有权对违反协议的用户采取限制或终止服务等措施。
          <br><br>
          5. 本协议的解释权归智能垃圾管理平台所有。
        </p>
        <p v-else-if="dialogType === 'privacy'">
          《隐私政策》内容...
          <br><br>
          1. 我们会收集您的注册信息、设备信息、位置信息等，用于提供服务和改善用户体验。
          <br><br>
          2. 我们会采取合理措施保护您的个人信息安全，防止信息泄露、损毁和丢失。
          <br><br>
          3. 未经您的同意，我们不会向第三方共享您的个人信息，法律法规另有规定的除外。
          <br><br>
          4. 您有权访问、更正、删除您的个人信息，并可以撤回同意或注销账号。
          <br><br>
          5. 我们可能会更新本隐私政策，更新后会在平台醒目位置公示。
        </p>
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
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Phone, Message } from '@element-plus/icons-vue';
import { register } from '@/services/userService';

const router = useRouter();
const registerFormRef = ref(null);
const registerLoading = ref(false);

// 注册表单
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  verificationCode: '',
  email: '',
  agreement: false
});

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
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
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

// 验证码倒计时
const countDown = ref(0);
const isCountingDown = computed(() => countDown.value > 0);
const countDownText = computed(() => isCountingDown.value ? `${countDown.value}秒后重新获取` : '获取验证码');

// 发送验证码
const sendVerificationCode = async () => {
  if (!registerForm.phone) {
    ElMessage.warning('请先输入手机号');
    return;
  }
  
  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号码');
    return;
  }
  
  // 模拟发送验证码
  ElMessage.success('验证码已发送，请注意查收');
  
  // 开始倒计时
  countDown.value = 60;
  const timer = setInterval(() => {
    countDown.value--;
    if (countDown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

// 密码强度
const getPasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  
  // 长度检查
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // 字符类型检查
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return Math.min(strength, 5);
};

const passwordStrength = computed(() => getPasswordStrength(registerForm.password));

const strengthText = computed(() => {
  const strength = passwordStrength.value;
  if (strength === 0) return '非常弱';
  if (strength === 1) return '弱';
  if (strength === 2) return '中等';
  if (strength === 3) return '强';
  if (strength >= 4) return '非常强';
});

const strengthClass = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return 'text-danger';
  if (strength === 2) return 'text-warning';
  if (strength === 3) return 'text-success';
  if (strength >= 4) return 'text-primary';
});

const strengthColor = computed(() => {
  const strength = passwordStrength.value;
  if (strength <= 1) return '#f56c6c';
  if (strength === 2) return '#e6a23c';
  if (strength === 3) return '#67c23a';
  if (strength >= 4) return '#409eff';
});

const strengthPercentage = computed(() => {
  return `${(passwordStrength.value / 5) * 100}%`;
});

// 协议对话框
const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogType = ref('');

const showAgreement = () => {
  dialogTitle.value = '用户协议';
  dialogType.value = 'agreement';
  dialogVisible.value = true;
};

const showPrivacy = () => {
  dialogTitle.value = '隐私政策';
  dialogType.value = 'privacy';
  dialogVisible.value = true;
};

const agreeAndClose = () => {
  registerForm.agreement = true;
  dialogVisible.value = false;
};

// 跳转到登录页
const goToLogin = () => {
  router.push('/login');
};

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
  if (!registerForm.agreement) {
    ElMessage.warning('请阅读并同意用户协议和隐私政策');
    return;
  }
  
  try {
    await registerFormRef.value.validate();
    registerLoading.value = true;
    
    // 调用注册API
    const res = await register({
      username: registerForm.username,
      password: registerForm.password,
      phone: registerForm.phone,
      email: registerForm.email
    });
    
    if (res.code === 200) {
      ElMessage.success('注册成功，请登录');
      
      // 清空注册表单
      registerFormRef.value.resetFields();
      
      // 跳转到登录页
      router.push('/login');
    } else {
      ElMessage.error(res.message || '注册失败');
    }
  } catch (error) {
    console.error('注册失败:', error);
  } finally {
    registerLoading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('@/assets/images/login-bg.svg');
  background-size: cover;
  background-position: center;
}

.register-container {
  width: 100%;
  max-width: 500px;
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
}

.register-card {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 5px;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.password-strength {
  margin-top: 5px;
  font-size: 12px;
}

.strength-title {
  margin-bottom: 5px;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.text-primary {
  color: #409eff;
}

.strength-bar {
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.strength-indicator {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.register-button {
  width: 100%;
}

.agreement-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
}

.and-text {
  color: #666;
}

.login-link {
  margin-top: 15px;
  text-align: center;
  color: #666;
}

.agreement-content {
  max-height: 400px;
  overflow-y: auto;
}

.register-footer {
  margin-top: 20px;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .register-container {
    padding: 15px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
  
  .card-header h2 {
    font-size: 20px;
  }
  
  .agreement-row {
    font-size: 12px;
  }
}
</style> 