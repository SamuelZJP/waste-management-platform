<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-header">
        <img src="@/assets/images/logo.svg" alt="智能垃圾管理平台" class="logo" />
        <h1 class="title">智能垃圾管理平台</h1>
        <div class="subtitle">管理员控制台</div>
      </div>
      
      <el-card class="login-card">
        <div class="card-header">
          <h2>管理员登录</h2>
        </div>
        
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
              placeholder="请输入管理员用户名" 
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
          
          <el-form-item prop="captcha" label="验证码">
            <div class="captcha-container">
              <el-input 
                v-model="loginForm.captcha" 
                placeholder="请输入验证码" 
                clearable
              />
              <div class="captcha-img" @click="refreshCaptcha">
                <img :src="captchaUrl" alt="验证码" />
              </div>
            </div>
          </el-form-item>
          
          <div class="remember-row">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <el-link type="primary" :underline="false" @click="forgetPassword">忘记密码</el-link>
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
          
          <div class="register-link">
            还没有账号？<el-link type="primary" :underline="false" @click="goToRegister">申请管理员账号</el-link>
          </div>
        </el-form>
      </el-card>
      
      <div class="login-footer">
        <p>© 2025 智能垃圾管理平台 版权所有</p>
        <p>技术支持：XX环保科技有限公司</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { adminLogin } from '@/services/adminService';

const router = useRouter();
const loginFormRef = ref(null);
const loginLoading = ref(false);
const captchaUrl = ref('');

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false
});

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '验证码长度不正确', trigger: 'blur' }
  ]
};

// 加载验证码
const loadCaptcha = () => {
  // 实际项目中应该调用API获取验证码
  // 这里使用模拟数据
  captchaUrl.value = `https://picsum.photos/110/38?random=${Date.now()}`;
};

// 刷新验证码
const refreshCaptcha = () => {
  loadCaptcha();
  loginForm.captcha = '';
};

// 忘记密码
const forgetPassword = () => {
  ElMessage.info('请联系系统管理员重置密码');
};

// 跳转到注册页
const goToRegister = () => {
  router.push('/admin/register');
};

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  
  try {
    await loginFormRef.value.validate();
    loginLoading.value = true;
    
    // 调用登录API
    const res = await adminLogin({
      username: loginForm.username,
      password: loginForm.password,
      captcha: loginForm.captcha
    });
    
    if (res.code === 200) {
      ElMessage.success('登录成功');
      
      // 存储token和管理员信息
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminInfo', JSON.stringify(res.data.adminInfo));
      
      // 跳转到管理员首页
      router.push('/admin/dashboard');
    } else {
      ElMessage.error(res.message || '登录失败');
      refreshCaptcha();
    }
  } catch (error) {
    console.error('登录失败:', error);
    
    // 模拟登录成功，仅用于开发预览
    if (loginForm.username && loginForm.password && loginForm.captcha) {
      ElMessage.success('登录成功（模拟）');
      
      // 存储模拟的物业管理员信息
      const mockAdminInfo = {
        id: '1',
        name: '张管理',
        avatar: '/src/assets/images/avatar-admin.svg',
        communityId: '1',
        communityName: '阳光花园小区',
        role: 'property_admin'
      };
      localStorage.setItem('adminInfo', JSON.stringify(mockAdminInfo));
      
      router.push('/admin/dashboard');
    } else {
      ElMessage.error('请填写完整的登录信息');
      refreshCaptcha();
    }
  } finally {
    loginLoading.value = false;
  }
};

onMounted(() => {
  loadCaptcha();
});
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: linear-gradient(to right bottom, #263238, #37474f);
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
  margin-bottom: 5px;
}

.subtitle {
  color: #e0e0e0;
  font-size: 18px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.login-card {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.captcha-container {
  display: flex;
  gap: 10px;
}

.captcha-img {
  height: 38px;
  width: 110px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.captcha-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.register-link {
  margin-top: 15px;
  text-align: center;
  color: #666;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  color: #e0e0e0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-size: 14px;
}

.login-footer p {
  margin: 5px 0;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .login-container {
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
}
</style> 