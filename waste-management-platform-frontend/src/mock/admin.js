/**
 * 管理员相关模拟数据
 */

export const adminData = {
  adminInfo: {
    id: '1',
    username: 'admin',
    name: '张管理',
    avatar: '/src/assets/images/avatar-admin.svg',
    phone: '13800138000',
    email: 'admin@example.com',
    stationId: '1',
    role: 'station_admin',
    createTime: '2025-01-15 10:00:00'
  },
  stations: [
    { id: '1', name: '海淀区西二旗回收站' },
    { id: '2', name: '朝阳区望京回收站' },
    { id: '3', name: '东城区建国门回收站' },
    { id: '4', name: '西城区西单回收站' },
    { id: '5', name: '丰台区方庄回收站' },
    { id: '6', name: '石景山区鲁谷回收站' }
  ],
  devices: [
    { id: '1', name: '压缩设备-A1', type: '垃圾压缩机', status: 'normal' },
    { id: '2', name: '分类设备-B1', type: '智能分类器', status: 'warning' },
    { id: '3', name: '监控设备-C1', type: '摄像头', status: 'normal' },
    { id: '4', name: '称重设备-D1', type: '电子秤', status: 'error' },
    { id: '5', name: '环境监测-E1', type: '空气质量检测仪', status: 'normal' }
  ],
  notifications: [
    { 
      id: '1', 
      title: '有新的用户反馈待处理', 
      content: '用户张三提交了关于回收站设备故障的反馈，请及时处理。',
      time: '2025-06-01 10:30:00',
      type: 'warning',
      isRead: false
    },
    { 
      id: '2', 
      title: '本月回收数据报表已生成', 
      content: '5月份回收数据报表已生成，可在报表中心查看详情。',
      time: '2025-06-01 09:15:00',
      type: 'success',
      isRead: true
    },
    { 
      id: '3', 
      title: '系统更新通知', 
      content: '系统将在今晚23:00-次日凌晨2:00进行版本更新，期间部分功能可能不可用。',
      time: '2025-05-31 16:30:00',
      type: 'info',
      isRead: true
    },
    { 
      id: '4', 
      title: '设备维护提醒', 
      content: '根据设备运行记录，建议对分类设备B1进行例行维护检查。',
      time: '2025-05-30 14:20:00',
      type: 'warning',
      isRead: true
    }
  ],
  events: [
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
  ],
  dashboardData: {
    todayStats: {
      weight: 256.5,
      trend: 12.5,
      users: 43,
      usersTrend: -5.2
    },
    stationStats: {
      capacity: 75,
      pendingFeedbacks: 5
    },
    weeklyData: [
      { date: '6-1', weight: 235, users: 38 },
      { date: '6-2', weight: 210, users: 35 },
      { date: '6-3', weight: 190, users: 30 },
      { date: '6-4', weight: 220, users: 36 },
      { date: '6-5', weight: 240, users: 40 },
      { date: '6-6', weight: 250, users: 42 },
      { date: '6-7', weight: 256.5, users: 43 }
    ]
  }
};

export const adminLoginResponse = {
  code: 200,
  message: '登录成功',
  data: {
    token: 'admin-token-' + Date.now(),
    adminInfo: adminData.adminInfo
  },
  timestamp: new Date().getTime()
};

export const adminRegisterResponse = {
  code: 200,
  message: '申请提交成功',
  data: {
    applicationId: 'app-' + Date.now(),
    status: 'pending'
  },
  timestamp: new Date().getTime()
}; 