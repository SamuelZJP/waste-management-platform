/**
 * 管理员相关服务
 */
import request from '@/utils/request';
import { adminLoginResponse, adminRegisterResponse } from '@/mock/admin';
import { recyclePoints } from '@/mock/recycle';

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

/**
 * 获取垃圾站列表
 * @param {Object} params - 查询参数
 * @param {string} [params.communityId] - 社区ID
 * @param {string} [params.status] - 状态筛选
 * @returns {Promise}
 */
export function getStationsList(params = {}) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 使用recycle.js中的数据，转换为管理端需要的格式
        const stationsList = recyclePoints.map(point => {
          // 将用户端status(0,1,2)转换为管理端status(normal,warning,error)
          let status;
          switch(point.status) {
            case 1: status = 'normal'; break;
            case 2: status = 'warning'; break;
            case 0: status = 'error'; break;
            default: status = 'normal';
          }
          
          return {
            id: point.id.toString(),
            name: point.name,
            address: point.address,
            status: status,
            deviceCount: Math.floor(Math.random() * 6) + 2, // 随机设备数量
            todayVolume: Math.floor(Math.random() * 100) + 50, // 随机今日回收量
            capacity: point.capacity,
            lastUpdate: new Date().toLocaleString(), // 当前时间作为最后更新时间
            position: { 
              x: ((point.longitude - 119.7) * 500 + 50), // 简单转换经纬度到百分比位置
              y: ((point.latitude - 29.08) * 500 + 50)
            }
          };
        });
        
        // 根据状态筛选
        let filteredList = [...stationsList];
        if (params.status && params.status !== 'all') {
          filteredList = stationsList.filter(item => item.status === params.status);
        }
        
        resolve({
          code: 200,
          message: 'success',
          data: filteredList
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/stations/list',
    method: 'get',
    params
  });
}

/**
 * 获取垃圾站详情
 * @param {Object} params - 查询参数
 * @param {string} params.id - 垃圾站ID
 * @returns {Promise}
 */
export function getStationDetail(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 使用模拟数据
        resolve({
          code: 200,
          message: 'success',
          data: {
            id: params.id,
            name: `${params.id}号楼垃圾站`,
            address: '小区东北角1号楼旁',
            status: 'normal',
            statusMessage: '',
            lastUpdate: '2023-05-15 10:30:45',
            installTime: '2022-08-15',
            deviceCount: 5,
            manager: '张工',
            phone: '13800138000',
            lastMaintain: '2023-04-20',
            todayVolume: 120.5,
            volumeTrend: 8.3,
            todayUsers: 34,
            userTrend: 12.5,
            capacity: [
              { name: '厨余垃圾', value: 65 },
              { name: '可回收物', value: 45 },
              { name: '有害垃圾', value: 30 },
              { name: '其他垃圾', value: 85 }
            ],
            devices: [
              { 
                id: 'DEV-001', 
                name: '压缩设备-A1', 
                type: '垃圾压缩机', 
                installTime: '2022-08-15', 
                status: 'normal',
                lastMaintain: '2023-04-20'
              },
              { 
                id: 'DEV-002', 
                name: '分类设备-B1', 
                type: '智能分类器', 
                installTime: '2022-08-15', 
                status: 'warning',
                lastMaintain: '2023-04-20'
              },
              { 
                id: 'DEV-003', 
                name: '监控设备-C1', 
                type: '监控摄像头', 
                installTime: '2022-08-15',
                status: 'normal',
                lastMaintain: '2023-04-20'
              },
              { 
                id: 'DEV-004', 
                name: '称重设备-D1', 
                type: '电子秤', 
                installTime: '2022-08-15', 
                status: 'error',
                lastMaintain: '2023-03-10'
              },
              { 
                id: 'DEV-005', 
                name: '环境监测-E1', 
                type: '空气质量检测仪', 
                installTime: '2022-08-15',
                status: 'normal',
                lastMaintain: '2023-04-20'
              }
            ],
            activities: [
              { 
                time: '2023-05-15 10:30', 
                type: 'success', 
                title: '居民投放回收',
                content: '3公斤厨余垃圾，2公斤可回收物'
              },
              { 
                time: '2023-05-15 09:45', 
                type: 'primary', 
                title: '系统自动称重',
                content: '厨余垃圾容器重量记录：65%'
              },
              { 
                time: '2023-05-15 08:20', 
                type: 'warning', 
                title: '设备状态预警',
                content: '称重设备-D1通信延迟'
              },
              { 
                time: '2023-05-15 07:30', 
                type: 'success', 
                title: '居民投放回收',
                content: '1.5公斤有害垃圾'
              },
              { 
                time: '2023-05-15 06:15', 
                type: 'success', 
                title: '环卫清运',
                content: '已清运其他垃圾'
              }
            ]
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/stations/detail',
    method: 'get',
    params
  });
}

/**
 * 获取工单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页条数
 * @param {string} [params.stationId] - 垃圾站ID
 * @param {string} [params.status] - 工单状态
 * @param {string} [params.priority] - 优先级
 * @returns {Promise}
 */
export function getIssuesList(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 使用模拟数据
        resolve({
          code: 200,
          message: 'success',
          data: {
            total: 15,
            list: []
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/issues/list',
    method: 'get',
    params
  });
}

/**
 * 获取统计数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getStatisticsData(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 使用模拟数据
        resolve({
          code: 200,
          message: 'success',
          data: {
            overview: {
              totalWeight: 1530.5,
              weightTrend: 8.3,
              totalUsers: 425,
              userTrend: 12.5,
              totalTimes: 1256,
              timesTrend: -3.8,
              dailyAvg: 153.1,
              dailyTrend: 5.2
            },
            list: [],
            total: 0
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/statistics',
    method: 'get',
    params
  });
}

/**
 * 获取通知详情
 * @param {string} id - 通知ID
 * @returns {Promise}
 */
export function getNotificationDetail(id) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 使用模拟数据
        resolve({
          code: 200,
          message: 'success',
          data: {
            id: id,
            title: '系统升级维护通知',
            content: '尊敬的管理员：\n\n我们计划于2023年8月20日22:00至8月21日02:00进行系统升级维护，期间系统将暂停服务。\n\n请各位管理员提前安排工作，并通知相关人员。',
            time: '2023-08-15 10:30:00',
            type: 'system',
            isRead: false,
            source: '系统管理员'
          }
        });
      }, 300);
    });
  }
  return request({
    url: `/admin/notifications/${id}`,
    method: 'get'
  });
}

/**
 * 更新通知状态
 * @param {string} id - 通知ID
 * @param {boolean} isRead - 是否已读
 * @returns {Promise}
 */
export function updateNotificationStatus(id, isRead) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: null
        });
      }, 300);
    });
  }
  return request({
    url: `/admin/notifications/${id}/status`,
    method: 'put',
    data: { isRead }
  });
}

/**
 * 获取居民用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页条数
 * @param {string} [params.keyword] - 关键词搜索
 * @param {string} [params.status] - 用户状态
 * @returns {Promise}
 */
export function getUsersList(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟用户数据
        const mockUsers = [
          {
            id: 'U10001',
            username: '张明',
            phone: '138****1234',
            email: 'zhangming@example.com',
            address: '上海财经大学浙江学院',
            status: 'normal',
            registerTime: '2023-01-15 09:25:36',
            lastLogin: '2023-05-15 18:30:12',
            recycleTimes: 28,
            recycleWeight: 85.6,
            points: 426,
            avatar: 'https://via.placeholder.com/40',
            records: [
              {
                time: '2023-05-14 10:15:30',
                station: '回收站A',
                category: '厨余垃圾',
                weight: '2.3',
                points: 12
              },
              {
                time: '2023-05-10 16:20:45',
                station: '回收站B',
                category: '可回收物',
                weight: '1.5',
                points: 15
              }
            ]
          },
          {
            id: 'U10002',
            username: '李华',
            phone: '139****5678',
            email: 'lihua@example.com',
            address: '上海财经大学浙江学院',
            status: 'normal',
            registerTime: '2023-02-20 15:40:22',
            lastLogin: '2023-05-14 10:15:08',
            recycleTimes: 16,
            recycleWeight: 45.2,
            points: 230,
            avatar: 'https://via.placeholder.com/40',
            records: [
              {
                time: '2023-05-13 09:10:20',
                station: '回收站C',
                category: '有害垃圾',
                weight: '0.8',
                points: 18
              }
            ]
          },
          {
            id: 'U10003',
            username: '王芳',
            phone: '137****9012',
            email: 'wangfang@example.com',
            address: '上海财经大学浙江学院',
            status: 'disabled',
            registerTime: '2023-03-05 11:18:45',
            lastLogin: '2023-04-28 16:42:30',
            recycleTimes: 8,
            recycleWeight: 22.4,
            points: 112,
            avatar: 'https://via.placeholder.com/40',
            records: [
              {
                time: '2023-04-25 14:30:15',
                station: '回收站D',
                category: '其他垃圾',
                weight: '3.2',
                points: 8
              }
            ]
          }
        ];
        
        // 根据关键词筛选
        let filteredUsers = [...mockUsers];
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredUsers = mockUsers.filter(user => 
            user.username.toLowerCase().includes(keyword) || 
            user.phone.includes(keyword) ||
            user.email.toLowerCase().includes(keyword)
          );
        }
        
        // 根据状态筛选
        if (params.status) {
          filteredUsers = filteredUsers.filter(user => user.status === params.status);
        }
        
        // 分页处理
        const start = (params.page - 1) * params.limit || 0;
        const end = start + (params.limit || 10);
        const pagedList = filteredUsers.slice(start, end);
        
        // 用户统计数据
        const stats = {
          total: 432,
          active: 285,
          newToday: 12,
          recycleAvg: 42.5
        };
        
        resolve({
          code: 200,
          message: 'success',
          data: {
            list: pagedList,
            total: filteredUsers.length,
            stats
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/users/list',
    method: 'get',
    params
  });
}

/**
 * 获取管理员用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页条数
 * @param {string} [params.keyword] - 关键词搜索
 * @param {string} [params.role] - 管理员角色
 * @returns {Promise}
 */
export function getAdminsList(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟管理员数据
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
        
        // 根据关键词筛选
        let filteredAdmins = [...mockAdmins];
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredAdmins = mockAdmins.filter(admin => 
            admin.name.toLowerCase().includes(keyword) || 
            admin.phone.includes(keyword) ||
            admin.email.toLowerCase().includes(keyword)
          );
        }
        
        // 根据角色筛选
        if (params.role) {
          filteredAdmins = filteredAdmins.filter(admin => admin.role === params.role);
        }
        
        // 分页处理
        const start = (params.page - 1) * params.limit || 0;
        const end = start + (params.limit || 10);
        const pagedList = filteredAdmins.slice(start, end);
        
        resolve({
          code: 200,
          message: 'success',
          data: {
            list: pagedList,
            total: filteredAdmins.length
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/admins/list',
    method: 'get',
    params
  });
}

/**
 * 获取任务列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页条数
 * @param {string} [params.keyword] - 关键词搜索
 * @param {string} [params.status] - 任务状态
 * @param {string} [params.priority] - 任务优先级
 * @returns {Promise}
 */
export function getTasksList(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟任务数据
        const mockTasks = [
          {
            id: 'T1001',
            title: '7号楼垃圾站设备维修',
            description: '称重设备-D1出现故障，请安排维修人员前往处理',
            assignee: '李工',
            priority: 'high',
            status: 'processing',
            createTime: '2023-06-01 09:30:00',
            dueDate: '2023-06-01 14:00:00',
            progress: 60
          },
          {
            id: 'T1002',
            title: '5号楼垃圾站清运',
            description: '塑料回收区容量已达85%，请安排清运',
            assignee: '王师傅',
            priority: 'medium',
            status: 'pending',
            createTime: '2023-06-01 10:15:00',
            dueDate: '2023-06-01 16:00:00',
            progress: 0
          },
          {
            id: 'T1003',
            title: '小区垃圾分类宣传活动',
            description: '今日下午3点在小区广场举办垃圾分类宣传活动',
            assignee: '刘经理',
            priority: 'low',
            status: 'pending',
            createTime: '2023-05-31 14:00:00',
            dueDate: '2023-06-01 15:00:00',
            progress: 30
          },
          {
            id: 'T1004',
            title: '3号楼垃圾站年度检修',
            description: '按照年度计划对3号楼垃圾站设备进行全面检修',
            assignee: '张工',
            priority: 'medium',
            status: 'completed',
            createTime: '2023-05-28 09:00:00',
            dueDate: '2023-05-30 18:00:00',
            progress: 100
          },
          {
            id: 'T1005',
            title: '垃圾分类App功能测试',
            description: '测试新版App的垃圾识别功能',
            assignee: '技术部-小王',
            priority: 'medium',
            status: 'cancelled',
            createTime: '2023-05-25 10:30:00',
            dueDate: '2023-05-29 18:00:00',
            progress: 45
          }
        ];
        
        // 根据关键词筛选
        let filteredTasks = [...mockTasks];
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredTasks = mockTasks.filter(task => 
            task.title.toLowerCase().includes(keyword) || 
            task.description.toLowerCase().includes(keyword) ||
            task.assignee.toLowerCase().includes(keyword)
          );
        }
        
        // 根据状态筛选
        if (params.status) {
          filteredTasks = filteredTasks.filter(task => task.status === params.status);
        }
        
        // 根据优先级筛选
        if (params.priority) {
          filteredTasks = filteredTasks.filter(task => task.priority === params.priority);
        }
        
        // 分页处理
        const start = (params.page - 1) * params.limit || 0;
        const end = start + (params.limit || 10);
        const pagedList = filteredTasks.slice(start, end);
        
        // 任务统计数据
        const stats = {
          total: filteredTasks.length,
          processing: filteredTasks.filter(task => task.status === 'processing').length,
          todayDue: filteredTasks.filter(task => task.dueDate.includes('2023-06-01')).length,
          completed: filteredTasks.filter(task => task.status === 'completed').length
        };
        
        resolve({
          code: 200,
          message: 'success',
          data: {
            list: pagedList,
            total: filteredTasks.length,
            stats
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/tasks/list',
    method: 'get',
    params
  });
}

/**
 * 获取问题反馈列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页条数
 * @param {string} [params.keyword] - 关键词搜索
 * @param {string} [params.type] - 反馈类型
 * @param {string} [params.status] - 处理状态
 * @returns {Promise}
 */
export function getFeedbackList(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟反馈数据
        const mockFeedback = [
          {
            id: 'F1001',
            title: '垃圾站分类标识不清晰',
            content: '5号楼垃圾站的分类标识不够清晰，建议更新标识牌或增加更明显的指引。',
            username: '张明',
            contact: '138****1234',
            type: 'suggestion',
            status: 'pending',
            createTime: '2023-06-01 09:15:30',
            relatedDevice: '5号楼垃圾站',
            images: [
              'https://via.placeholder.com/300?text=Feedback+Image'
            ],
            replies: []
          },
          {
            id: 'F1002',
            title: '垃圾站满溢问题',
            content: '7号楼垃圾站的可回收物容器已满，但没有及时清运，导致垃圾无法投放。',
            username: '李华',
            contact: '139****5678',
            type: 'complaint',
            status: 'processing',
            createTime: '2023-05-31 16:40:22',
            relatedDevice: '7号楼垃圾站',
            images: [
              'https://via.placeholder.com/300?text=Feedback+Image+1',
              'https://via.placeholder.com/300?text=Feedback+Image+2'
            ],
            replies: [
              {
                user: '王管理员',
                content: '已收到您的反馈，我们会尽快安排清运。',
                time: '2023-05-31 17:30:15',
                type: 'primary'
              }
            ]
          },
          {
            id: 'F1003',
            title: '智能识别功能异常',
            content: 'APP的垃圾智能识别功能无法正常使用，扫描后一直显示加载中。',
            username: '王芳',
            contact: '137****9012',
            type: 'issue',
            status: 'resolved',
            createTime: '2023-05-30 11:20:45',
            relatedDevice: 'APP智能识别功能',
            images: [],
            replies: [
              {
                user: '技术支持-小李',
                content: '已收到您的反馈，我们正在排查问题。',
                time: '2023-05-30 14:10:23',
                type: 'primary'
              },
              {
                user: '技术支持-小李',
                content: '问题已定位，是服务器负载过高导致的。我们已经进行了扩容，现在应该可以正常使用了。请您再次尝试，如仍有问题请继续反馈。',
                time: '2023-05-30 16:45:30',
                type: 'success'
              }
            ]
          },
          {
            id: 'F1004',
            title: '积分兑换问题',
            content: '我的回收积分显示有500分，但是在兑换商城时显示积分不足。',
            username: '赵强',
            contact: '186****3456',
            type: 'question',
            status: 'closed',
            createTime: '2023-05-29 14:30:50',
            relatedDevice: '积分兑换系统',
            images: [],
            replies: [
              {
                user: '客服-小王',
                content: '您好，这可能是系统同步延迟导致的。请问您最近几天是否有新增积分？',
                time: '2023-05-29 15:20:10',
                type: 'primary'
              },
              {
                user: '赵强',
                content: '是的，昨天刚回收了一批纸板，得到了200积分。',
                time: '2023-05-29 16:05:45',
                type: 'info'
              },
              {
                user: '客服-小王',
                content: '了解了，新增积分有24小时的清算期，明天应该就能正常使用了。感谢您的理解！',
                time: '2023-05-29 16:30:22',
                type: 'success'
              }
            ]
          }
        ];
        
        // 根据关键词筛选
        let filteredFeedback = [...mockFeedback];
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase();
          filteredFeedback = mockFeedback.filter(feedback => 
            feedback.title.toLowerCase().includes(keyword) || 
            feedback.content.toLowerCase().includes(keyword)
          );
        }
        
        // 根据类型筛选
        if (params.type) {
          filteredFeedback = filteredFeedback.filter(feedback => feedback.type === params.type);
        }
        
        // 根据状态筛选
        if (params.status) {
          filteredFeedback = filteredFeedback.filter(feedback => feedback.status === params.status);
        }
        
        // 分页处理
        const start = (params.page - 1) * params.limit || 0;
        const end = start + (params.limit || 10);
        const pagedList = filteredFeedback.slice(start, end);
        
        // 反馈统计数据
        const stats = {
          unprocessed: filteredFeedback.filter(item => item.status === 'pending').length,
          processing: filteredFeedback.filter(item => item.status === 'processing').length,
          today: filteredFeedback.filter(item => item.createTime.includes('2023-06-01')).length,
          avgResponseTime: 3.5 // 模拟数据
        };
        
        resolve({
          code: 200,
          message: 'success',
          data: {
            list: pagedList,
            total: filteredFeedback.length,
            stats
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/feedback/list',
    method: 'get',
    params
  });
}

/**
 * 获取反馈详情
 * @param {string} id - 反馈ID
 * @returns {Promise}
 */
export function getFeedbackDetail(id) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟获取特定ID的反馈
        const feedback = {
          id: id,
          title: '垃圾站分类标识不清晰',
          content: '5号楼垃圾站的分类标识不够清晰，建议更新标识牌或增加更明显的指引。',
          username: '张明',
          contact: '138****1234',
          type: 'suggestion',
          status: 'pending',
          createTime: '2023-06-01 09:15:30',
          relatedDevice: '5号楼垃圾站',
          images: [
            'https://via.placeholder.com/300?text=Feedback+Image'
          ],
          replies: []
        };
        
        resolve({
          code: 200,
          message: 'success',
          data: feedback
        });
      }, 300);
    });
  }
  return request({
    url: `/admin/feedback/${id}`,
    method: 'get'
  });
}

/**
 * 获取系统设置
 * @returns {Promise}
 */
export function getSystemSettings() {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: {
            basic: {
              systemName: '智能垃圾分类管理平台',
              communityName: '阳光花园小区',
              contactPhone: '400-123-4567',
              adminEmail: 'admin@example.com',
              language: 'zh-CN'
            },
            notification: {
              enableSystemNotify: true,
              enableDeviceAlert: true,
              capacityThreshold: 80,
              notifyMethods: ['email', 'app']
            },
            security: {
              enableBackup: true,
              backupFrequency: 'daily',
              logRetention: '90'
            }
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/admin/settings',
    method: 'get'
  });
}

/**
 * 更新系统设置
 * @param {Object} data - 设置数据
 * @param {Object} data.basic - 基本设置
 * @param {Object} data.notification - 通知设置
 * @param {Object} data.security - 安全设置
 * @returns {Promise}
 */
export function updateSystemSettings(data) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: {
            updated: true
          }
        });
      }, 500);
    });
  }
  return request({
    url: '/admin/settings',
    method: 'post',
    data
  });
} 