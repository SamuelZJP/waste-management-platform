/**
 * 垃圾分类相关服务
 */
import request from '@/utils/request';
import { wasteCategories, wasteItems, recognizeResult, searchResult } from '@/mock/waste';

// 使用mock数据模拟API请求
// 垃圾识别接口使用真实API请求，其他功能仍使用模拟数据
const useMock = true;

/**
 * 获取垃圾分类目录
 * @returns {Promise}
 */
export function getWasteCategories() {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: 'success',
          data: wasteCategories
        });
      }, 300);
    });
  }
  return request({
    url: '/waste/categories',
    method: 'get'
  });
}

/**
 * 获取垃圾项目列表
 * @param {Object} params - 查询参数
 * @param {string} params.category - 分类名称（可选）
 * @param {number} params.page - 页码（可选）
 * @param {number} params.size - 每页条数（可选）
 * @returns {Promise}
 */
export function getWasteItems(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        // 根据分类筛选
        let filteredItems = params.category 
          ? wasteItems.filter(item => item.category === params.category)
          : wasteItems;
        
        resolve({
          code: 200,
          message: 'success',
          data: {
            items: filteredItems,
            total: filteredItems.length
          }
        });
      }, 300);
    });
  }
  return request({
    url: '/waste/items',
    method: 'get',
    params
  });
}

/**
 * 关键词搜索垃圾
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise}
 */
export function searchWaste(params) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(searchResult);
      }, 300);
    });
  }
  return request({
    url: '/waste/search',
    method: 'get',
    params
  });
}

/**
 * 垃圾图片识别
 * @param {FormData} formData - 包含图片文件的表单数据
 * @returns {Promise}
 */
export function recognizeWaste(formData) {
  // 垃圾识别功能始终使用实际API
  return request({
    url: '/waste/recognize',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 获取垃圾详情
 * @param {number} id - 垃圾项目ID
 * @returns {Promise}
 */
export function getWasteDetail(id) {
  if (useMock) {
    return new Promise(resolve => {
      setTimeout(() => {
        const item = wasteItems.find(item => item.id === Number(id));
        resolve({
          code: 200,
          message: 'success',
          data: item
        });
      }, 300);
    });
  }
  return request({
    url: `/waste/detail/${id}`,
    method: 'get'
  });
} 