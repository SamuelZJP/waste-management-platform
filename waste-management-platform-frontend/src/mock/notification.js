/**
 * 通知相关模拟数据
 */

// 通知列表
export const notifications = [
  {
    id: 1,
    title: '系统升级通知',
    content: '系统将于2025年5月15日22:00-24:00进行升级维护，期间服务可能暂时不可用，请提前做好安排。',
    type: 'SYSTEM',
    isRead: 0,
    createTime: '2025-05-06 10:00:00'
  },
  {
    id: 2,
    title: '回收站A设备故障通知',
    content: '社区回收站A的智能垃圾箱出现故障，工作人员正在抢修中，预计今天下午恢复正常。',
    type: 'DEVICE',
    isRead: 1,
    createTime: '2025-05-05 09:15:00'
  },
  {
    id: 3,
    title: '垃圾分类活动邀请',
    content: '本周六上午10点在社区广场举办垃圾分类知识普及活动，欢迎参加。',
    type: 'ACTIVITY',
    isRead: 0,
    createTime: '2025-05-04 14:30:00'
  },
  {
    id: 4,
    title: '新增回收点通知',
    content: '社区内新增一处智能回收点，位于小区南门，支持24小时自助回收服务。',
    type: 'SYSTEM',
    isRead: 0,
    createTime: '2025-05-03 11:20:00'
  },
  {
    id: 5,
    title: '回收规则更新',
    content: '根据最新政策，塑料袋现归类为可回收物，请按照新规则进行垃圾分类。',
    type: 'SYSTEM',
    isRead: 1,
    createTime: '2025-05-02 16:45:00'
  }
];

// 通知列表查询结果
export const notificationList = {
  code: 200,
  message: 'success',
  data: {
    notifications: notifications,
    total: notifications.length,
    page: 1,
    size: 10,
    unreadCount: notifications.filter(item => item.isRead === 0).length
  },
  timestamp: new Date().getTime()
};

// 标记已读结果
export const markReadResult = {
  code: 200,
  message: '已标记为已读',
  data: null,
  timestamp: new Date().getTime()
}; 