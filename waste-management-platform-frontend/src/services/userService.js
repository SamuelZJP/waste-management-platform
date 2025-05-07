/**
 * 用户相关服务
 */
import request from '@/utils/request';
import { loginResponse, registerResponse, userData } from '@/mock/user';

// 使用mock数据模拟API请求
const useMock = true;

/**
 * 用户登录
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise}
 */
export function login(data) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(loginResponse);
      }, 500);
    });
  }
  return request({
    url: '/user/login',
    method: 'post',
    data
  });
}

/**
 * 用户注册
 * @param {Object} data - 注册参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.phone - 手机号
 * @param {string} data.email - 邮箱
 * @returns {Promise}
 */
export function register(data) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(registerResponse);
      }, 500);
    });
  }
  return request({
    url: '/user/register',
    method: 'post',
    data
  });
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: userData.userInfo
        });
      }, 300);
    });
  }
  return request({
    url: '/user/info',
    method: 'get'
  });
}

/**
 * 修改用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function updateUserInfo(data) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '更新成功',
          data: {
            ...userData.userInfo,
            ...data
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/user/info',
    method: 'put',
    data
  });
}

/**
 * 修改密码
 * @param {Object} data - 密码信息
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise}
 */
export function changePassword(data) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '密码修改成功',
          data: null
        });
      }, 300);
    });
  }
  return request({
    url: '/user/password',
    method: 'put',
    data
  });
} 