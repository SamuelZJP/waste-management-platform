/**
 * 通知相关服务
 */
import request from '@/utils/request';
import { notificationList, markReadResult } from '@/mock/notification';

// 使用mock数据模拟API请求
const useMock = true;

/**
 * 获取通知列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（可选）
 * @param {number} params.size - 每页条数（可选）
 * @param {number} params.isRead - 是否已读(0:未读,1:已读)（可选）
 * @returns {Promise}
 */
export function getNotificationList(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(notificationList);
      }, 300);
    });
  }
  return request({
    url: '/notification/list',
    method: 'get',
    params
  });
}

/**
 * 获取通知列表 (别名，兼容已有代码)
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getNotifications(params) {
  return getNotificationList(params);
}

/**
 * 标记通知为已读
 * @param {number} notificationId - 通知ID
 * @returns {Promise}
 */
export function markNotificationRead(notificationId) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(markReadResult);
      }, 300);
    });
  }
  return request({
    url: `/notification/read/${notificationId}`,
    method: 'put'
  });
}

/**
 * 标记通知为已读 (别名，兼容已有代码)
 * @param {number} notificationId - 通知ID
 * @returns {Promise}
 */
export function markAsRead(notificationId) {
  return markNotificationRead(notificationId);
}

/**
 * 标记所有通知为已读
 * @returns {Promise}
 */
export function markAllNotificationsRead() {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '所有通知已标记为已读',
          data: null,
          timestamp: new Date().getTime()
        });
      }, 300);
    });
  }
  return request({
    url: '/notification/read/all',
    method: 'put'
  });
}

/**
 * 获取未读通知数量
 * @returns {Promise}
 */
export function getUnreadCount() {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: {
            unreadCount: 3
          },
          timestamp: new Date().getTime()
        });
      }, 300);
    });
  }
  return request({
    url: '/notification/unread/count',
    method: 'get'
  });
}

/**
 * 删除通知
 * @param {number} notificationId - 通知ID
 * @returns {Promise}
 */
export function deleteNotification(notificationId) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '通知已删除',
          data: null,
          timestamp: new Date().getTime()
        });
      }, 300);
    });
  }
  return request({
    url: `/notification/${notificationId}`,
    method: 'delete'
  });
} 