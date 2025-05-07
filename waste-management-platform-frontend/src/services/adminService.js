/**
 * 管理员相关服务
 */
import request from '@/utils/request';
import { adminLoginResponse, adminRegisterResponse } from '@/mock/admin';

// 使用mock数据模拟API请求
const useMock = true;

/**
 * 管理员登录
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.captcha - 验证码
 * @returns {Promise}
 */
export function adminLogin(data) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(adminLoginResponse);
      }, 500);
    });
  }
  return request({
    url: '/admin/login',
    method: 'post',
    data
  });
}

/**
 * 管理员注册
 * @param {Object} data - 注册参数
 * @returns {Promise}
 */
export function registerAdmin(data) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(adminRegisterResponse);
      }, 500);
    });
  }
  return request({
    url: '/admin/register',
    method: 'post',
    data
  });
}

/**
 * 获取管理员仪表盘数据
 * @param {Object} params - 查询参数
 * @param {string} [params.communityId] - 社区ID
 * @param {string} [params.stationId] - 垃圾站ID
 * @returns {Promise}
 */
export function getAdminDashboardData(params = {}) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 根据是否指定了特定垃圾站，返回不同的数据
        if (params.stationId && params.stationId !== 'all') {
          resolve({
            code: 200,
            message: 'success',
            data: {
              todayStats: {
                weight: 65.8,
                trend: 5.2,
                users: 12,
                usersTrend: 8.7
              },
              stationStats: {
                capacity: params.stationId === '3' ? 85 : (params.stationId === '4' ? 65 : 45),
                pendingIssues: params.stationId === '4' ? 2 : 0
              }
            }
          });
        } else {
          // 返回整个社区的汇总数据
          resolve({
            code: 200,
            message: 'success',
            data: {
              todayStats: {
                weight: 356.5,
                trend: 8.3,
                users: 67,
                usersTrend: 12.5
              },
              stationStats: {
                avgCapacity: 62,
                pendingIssues: 3
              },
              stationSummary: {
                total: 6,
                online: 4,
                warning: 1,
                offline: 1
              }
            }
          });
        }
      }, 300);
    });
  }
  return request({
    url: '/admin/dashboard',
    method: 'get',
    params
  });
}

/**
 * 获取设备状态
 * @param {Object} params - 查询参数
 * @param {string} [params.communityId] - 社区ID
 * @param {string} [params.stationId] - 垃圾站ID
 * @returns {Promise}
 */
export function getDeviceStatus(params = {}) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 全部设备列表
        const allDevices = [
          { id: '1', name: '压缩设备-A1', type: '垃圾压缩机', status: 'normal', stationName: '1号楼垃圾站', stationId: '1' },
          { id: '2', name: '分类设备-B1', type: '智能分类器', status: 'warning', stationName: '3号楼垃圾站', stationId: '2' },
          { id: '3', name: '监控设备-C1', type: '摄像头', status: 'normal', stationName: '5号楼垃圾站', stationId: '3' },
          { id: '4', name: '称重设备-D1', type: '电子秤', status: 'error', stationName: '7号楼垃圾站', stationId: '4' },
          { id: '5', name: '环境监测-E1', type: '空气质量检测仪', status: 'normal', stationName: '9号楼垃圾站', stationId: '5' }
        ];
        
        // 根据查询参数筛选设备
        let filteredDevices = [...allDevices];
        
        if (params.stationId && params.stationId !== 'all') {
          filteredDevices = allDevices.filter(device => device.stationId === params.stationId);
        }
        
        resolve({
          code: 200,
          message: 'success',
          data: filteredDevices
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/devices/status',
    method: 'get',
    params
  });
}

/**
 * 获取管理员通知列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页条数
 * @param {string} [params.communityId] - 社区ID
 * @returns {Promise}
 */
export function getAdminNotifications(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟通知数据
        const notificationList = [
          { 
            id: '1', 
            title: '7号楼垃圾站设备故障', 
            time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            type: 'warning',
            isRead: false,
            communityId: '1'
          },
          { 
            id: '2', 
            title: '本月垃圾回收数据报表已生成', 
            time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            type: 'success',
            isRead: true,
            communityId: '1'
          },
          { 
            id: '3', 
            title: '新的居民反馈需处理', 
            time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            type: 'info',
            isRead: true,
            communityId: '1'
          },
          { 
            id: '4', 
            title: '系统更新通知', 
            time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            type: 'info',
            isRead: true,
            communityId: '1'
          }
        ];
        
        // 根据社区ID筛选
        let filteredList = [...notificationList];
        if (params.communityId) {
          filteredList = notificationList.filter(item => item.communityId === params.communityId);
        }
        
        // 分页处理
        const start = (params.page - 1) * params.limit || 0;
        const end = start + (params.limit || 10);
        const pagedList = filteredList.slice(start, end);
        
        resolve({
          code: 200,
          message: 'success',
          data: {
            total: filteredList.length,
            list: pagedList
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/notifications',
    method: 'get',
    params
  });
}

/**
 * 获取回收站列表
 * @returns {Promise}
 */
export function getRecycleStations() {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: [
            { id: '1', name: '海淀区西二旗回收站' },
            { id: '2', name: '朝阳区望京回收站' },
            { id: '3', name: '东城区建国门回收站' },
            { id: '4', name: '西城区西单回收站' },
            { id: '5', name: '丰台区方庄回收站' },
            { id: '6', name: '石景山区鲁谷回收站' }
          ]
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/stations',
    method: 'get'
  });
}

/**
 * 获取最近事件
 * @param {Object} params - 查询参数
 * @param {number} params.limit - 限制条数
 * @returns {Promise}
 */
export function getRecentEvents(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: [
            { 
              id: '1', 
              title: '设备故障', 
              description: '称重设备-D1出现故障，请及时检查维修',
              time: '2025-06-01 10:30:25',
              type: 'danger'
            },
            { 
              id: '2', 
              title: '容量预警', 
              description: '塑料回收区容量已达80%，请及时处理',
              time: '2025-06-01 09:15:10',
              type: 'warning'
            },
            { 
              id: '3', 
              title: '系统维护', 
              description: '系统将于今日23:00-次日2:00进行维护升级',
              time: '2025-06-01 08:00:00',
              type: 'info'
            }
          ]
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/events/recent',
    method: 'get',
    params
  });
}

/**
 * 获取社区内垃圾站列表
 * @param {Object} params - 查询参数
 * @param {string} params.communityId - 社区ID
 * @returns {Promise}
 */
export function getCommunityStations(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 使用模拟数据
        resolve({
          code: 200,
          message: 'success',
          data: [
            { id: '1', name: '1号楼垃圾站', status: 'normal', address: '小区东北角1号楼旁' },
            { id: '2', name: '3号楼垃圾站', status: 'normal', address: '小区中心3号楼旁' },
            { id: '3', name: '5号楼垃圾站', status: 'warning', address: '小区西南角5号楼旁' },
            { id: '4', name: '7号楼垃圾站', status: 'error', address: '小区东南角7号楼旁' },
            { id: '5', name: '9号楼垃圾站', status: 'normal', address: '小区西北角9号楼旁' },
            { id: '6', name: '11号楼垃圾站', status: 'normal', address: '小区北门11号楼旁' }
          ]
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/community/stations',
    method: 'get',
    params
  });
}

/**
 * 获取需要关注的垃圾站（预警或故障状态）
 * @param {Object} params - 查询参数
 * @param {string} params.communityId - 社区ID
 * @returns {Promise}
 */
export function getWarningStations(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 使用模拟数据
        resolve({
          code: 200,
          message: 'success',
          data: [
            { 
              id: '3', 
              name: '5号楼垃圾站', 
              address: '小区西南角5号楼旁',
              statusType: 'warning',
              statusText: '容量预警',
              capacity: 85
            },
            { 
              id: '4', 
              name: '7号楼垃圾站', 
              address: '小区东南角7号楼旁',
              statusType: 'danger',
              statusText: '设备故障',
              capacity: 65
            }
          ]
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/stations/warning',
    method: 'get',
    params
  });
}

/**
 * 获取今日任务
 * @param {Object} params - 查询参数
 * @param {string} params.communityId - 社区ID
 * @returns {Promise}
 */
export function getTodayTasks(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 使用模拟数据
        resolve({
          code: 200,
          message: 'success',
          data: [
            { 
              id: '1', 
              title: '7号楼垃圾站设备维修', 
              description: '称重设备-D1出现故障，请安排维修人员前往处理',
              time: '10:30',
              priority: 'danger',
              completed: false
            },
            { 
              id: '2', 
              title: '5号楼垃圾站清运', 
              description: '塑料回收区容量已达85%，请安排清运',
              time: '11:45',
              priority: 'warning',
              completed: false
            },
            { 
              id: '3', 
              title: '小区垃圾分类宣传活动', 
              description: '今日下午3点在小区广场举办垃圾分类宣传活动',
              time: '15:00',
              priority: 'info',
              completed: false
            }
          ]
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/tasks/today',
    method: 'get',
    params
  });
} 