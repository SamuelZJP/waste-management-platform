<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <img src="@/assets/images/logo.svg" alt="智能垃圾管理平台" class="logo" />
        <h1 class="title">智能垃圾管理平台</h1>
      </div>
      
      <el-card class="login-card">
        <el-tabs v-model="activeTab" class="login-tabs">
          <el-tab-pane name="login" label="登录">
            <el-form 
              ref="loginFormRef"
              :model="loginForm" 
              :rules="loginRules" 
              label-position="top"
              @keyup.enter="handleLogin"
            >
              <el-form-item prop="username" label="用户名">
                <el-input 
                  v-model="loginForm.username" 
                  placeholder="请输入用户名" 
                  prefix-icon="User"
                  clearable
                />
              </el-form-item>
              <el-form-item prop="password" label="密码">
                <el-input 
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="请输入密码" 
                  prefix-icon="Lock"
                  show-password
                  clearable
                />
              </el-form-item>
              <div class="remember-row">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                <el-link type="primary" :underline="false" @click="forgetPassword">忘记密码?</el-link>
              </div>
              <el-form-item>
                <el-button 
                  type="primary" 
                  class="login-button" 
                  :loading="loginLoading"
                  @click="handleLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
            <div class="other-login">
              <p class="other-title">其他登录方式</p>
              <div class="social-login">
                <el-button circle><el-icon><Message /></el-icon></el-button>
                <el-button circle><el-icon><Position /></el-icon></el-button>
                <el-button circle><el-icon><Cellphone /></el-icon></el-button>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane name="register" label="注册">
            <el-form 
              ref="registerFormRef"
              :model="registerForm" 
              :rules="registerRules" 
              label-position="top"
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
                <el-button 
                  type="primary" 
                  class="login-button" 
                  :loading="registerLoading"
                  @click="handleRegister"
                >
                  注册
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      
      <div class="login-footer">
        <p>© 2025 智能垃圾管理平台 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Message, Position, Cellphone } from '@element-plus/icons-vue';
import { login, register } from '@/services/userService';

const router = useRouter();
const activeTab = ref('login');
const loginLoading = ref(false);
const registerLoading = ref(false);

// 登录表单
const loginFormRef = ref(null);
const loginForm = reactive({
  username: '',
  password: '',
  remember: false
});

// 注册表单
const registerFormRef = ref(null);
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  email: ''
});

// 登录校验规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
  ]
};

// 注册校验规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
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
  ]
};

// 忘记密码
const forgetPassword = () => {
  ElMessage.info('请联系管理员重置密码');
};

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    loginLoading.value = true;
    
    // 调用登录API
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    });
    
    if (res.code === 200) {
      ElMessage.success('登录成功');
      
      // 存储token和用户信息
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo));
      
      // 跳转到首页
      router.push('/');
    } else {
      ElMessage.error(res.message || '登录失败');
    }
  } catch (error) {
    console.error('登录失败:', error);
  } finally {
    loginLoading.value = false;
  }
};

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return;
  
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
      
      // 切换到登录标签页
      activeTab.value = 'login';
      loginForm.username = registerForm.username;
      
      // 清空注册表单
      registerFormRef.value.resetFields();
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
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('@/assets/images/login-bg.svg');
  background-size: cover;
  background-position: center;
}

.login-container {
  width: 100%;
  max-width: 450px;
  padding: 20px;
}

.login-header {
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

.login-card {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.login-tabs {
  padding-top: 10px;
}

.remember-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.login-button {
  width: 100%;
}

.other-login {
  margin-top: 30px;
  text-align: center;
}

.other-title {
  color: #666;
  margin-bottom: 15px;
  position: relative;
  font-size: 14px;
}

.other-title:before,
.other-title:after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: #ddd;
}

.other-title:before {
  left: 0;
}

.other-title:after {
  right: 0;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .login-container {
    padding: 15px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .login-header {
    margin-bottom: 20px;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
}
</style> 