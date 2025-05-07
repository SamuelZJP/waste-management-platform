/**
 * 用户相关模拟数据
 */

export const userData = {
  userInfo: {
    id: 1,
    username: '测试用户',
    phone: '13800138000',
    email: 'test@example.com',
    avatar: '/src/assets/images/avatar-default.svg',
    createTime: '2025-05-01 10:00:00'
  }
};

export const loginResponse = {
  code: 200,
  message: '登录成功',
  data: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    userInfo: {
      userId: 1,
      username: '测试用户',
      role: 'USER'
    }
  },
  timestamp: new Date().getTime()
};

export const registerResponse = {
  code: 200,
  message: '注册成功',
  data: {
    userId: 1,
    username: '测试用户'
  },
  timestamp: new Date().getTime()
}; 