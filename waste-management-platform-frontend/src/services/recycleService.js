/**
 * 回收点相关服务
 */
import request from '@/utils/request';
import { nearbyRecyclePoints, recyclePointDetail, recyclePoints } from '@/mock/recycle';

// 使用mock数据模拟API请求
const useMock = true;

/**
 * 获取附近回收点
 * @param {Object} params - 查询参数
 * @param {number} params.longitude - 经度
 * @param {number} params.latitude - 纬度
 * @param {number} params.radius - 搜索半径，单位米（可选）
 * @returns {Promise}
 */
export function getNearbyRecyclePoints(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(nearbyRecyclePoints);
      }, 500);
    });
  }
  return request({
    url: '/recyclepoint/nearby',
    method: 'get',
    params
  });
}

/**
 * 获取回收点详情
 * @param {number} id - 回收点ID
 * @returns {Promise}
 */
export function getRecyclePointDetail(id) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(recyclePointDetail);
      }, 300);
    });
  }
  return request({
    url: `/recyclepoint/detail/${id}`,
    method: 'get'
  });
}

/**
 * 获取所有回收点
 * @returns {Promise}
 */
export function getAllRecyclePoints() {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: recyclePoints
        });
      }, 300);
    });
  }
  return request({
    url: '/recyclepoint/all',
    method: 'get'
  });
}

/**
 * 获取回收点容量信息
 * @param {number} id - 回收点ID
 * @returns {Promise}
 */
export function getRecyclePointCapacity(id) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        const point = recyclePoints.find(point => point.id === Number(id));
        resolve({
          code: 200,
          message: 'success',
          data: {
            id: point.id,
            name: point.name,
            capacity: point.capacity,
            wasteCapacity: [
              { type: '可回收物', capacity: 65 },
              { type: '厨余垃圾', capacity: 40 },
              { type: '有害垃圾', capacity: 20 },
              { type: '其他垃圾', capacity: 70 }
            ],
            lastUpdated: '2025-05-06 15:30:45'
          }
        });
      }, 300);
    });
  }
  return request({
    url: `/recyclepoint/capacity/${id}`,
    method: 'get'
  });
}

/**
 * 提交回收点反馈
 * @param {Object} data - 反馈数据
 * @param {number} data.recyclePointId - 回收点ID
 * @param {string} data.content - 反馈内容
 * @param {number} data.rating - 评分(1-5)
 * @returns {Promise}
 */
export function submitRecyclePointFeedback(data) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '反馈提交成功',
          data: {
            id: Math.floor(Math.random() * 1000),
            content: data.content,
            rating: data.rating,
            createTime: new Date().toISOString().split('T')[0]
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/recyclepoint/feedback',
    method: 'post',
    data
  });
} 