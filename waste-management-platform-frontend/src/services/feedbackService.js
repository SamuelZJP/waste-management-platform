import request from '@/utils/request';

/**
 * 提交用户反馈
 * @param {Object} data 反馈数据
 * @param {string} data.type 反馈类型
 * @param {string} data.title 反馈标题
 * @param {string} data.content 反馈内容
 * @param {string} data.contact 联系方式（可选）
 * @param {Array<string>} data.images 图片列表（可选）
 * @returns {Promise<Object>} 返回提交结果
 */
export function submitFeedback(data) {
  return request({
    url: '/feedback/submit',
    method: 'post',
    data
  });
}

/**
 * 获取用户反馈列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 当前页码
 * @param {number} [params.pageSize=10] 每页记录数
 * @param {string} [params.type] 反馈类型（可选）
 * @param {string} [params.status] 反馈状态（可选）
 * @returns {Promise<Object>} 返回反馈列表
 */
export function getFeedbackList(params) {
  return request({
    url: '/feedback/list',
    method: 'get',
    params
  });
}

/**
 * 获取反馈详情
 * @param {string} id 反馈ID
 * @returns {Promise<Object>} 返回反馈详情
 */
export function getFeedbackDetail(id) {
  return request({
    url: `/feedback/detail/${id}`,
    method: 'get'
  });
}

/**
 * 删除反馈
 * @param {string} id 反馈ID
 * @returns {Promise<Object>} 返回删除结果
 */
export function deleteFeedback(id) {
  return request({
    url: `/feedback/delete/${id}`,
    method: 'delete'
  });
}

/**
 * 更新反馈（例如取消反馈）
 * @param {string} id 反馈ID
 * @param {Object} data 更新数据
 * @returns {Promise<Object>} 返回更新结果
 */
export function updateFeedback(id, data) {
  return request({
    url: `/feedback/update/${id}`,
    method: 'put',
    data
  });
}

/**
 * 获取常见问题列表
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 当前页码
 * @param {number} [params.pageSize=10] 每页记录数
 * @param {string} [params.category] 问题分类（可选）
 * @returns {Promise<Object>} 返回常见问题列表
 */
export function getFaqList(params) {
  return request({
    url: '/feedback/faq/list',
    method: 'get',
    params
  });
}

/**
 * 获取反馈统计数据
 * @returns {Promise<Object>} 返回统计数据
 */
export function getFeedbackStats() {
  return request({
    url: '/feedback/stats',
    method: 'get'
  });
}

// 模拟数据 - 在实际API实现前使用
// 这些函数在实际API未开发完成时可以使用
export const mockFeedbackData = {
  list: [
    {
      id: '1',
      title: '识别功能有时不准确',
      content: '在识别一些复杂的垃圾时，如复合材料制品，识别结果经常不准确，希望能够改进算法提高准确率。',
      type: 'bug',
      status: 'replied',
      createTime: '2025-05-20 15:30',
      images: [
        'https://via.placeholder.com/150/4CAF50/FFFFFF?text=Image1',
        'https://via.placeholder.com/150/2196F3/FFFFFF?text=Image2'
      ],
      reply: {
        content: '感谢您的反馈！我们正在优化识别算法，预计下个版本将提升识别准确率。如遇到识别不准的情况，可以点击"纠错"提交正确分类。',
        time: '2025-05-21 10:15'
      }
    },
    {
      id: '2',
      title: '建议增加社区功能',
      content: '希望能增加一个环保社区，让用户可以分享环保经验和回收心得，相互交流学习。',
      type: 'feature',
      status: 'processing',
      createTime: '2025-05-18 09:45',
      images: []
    },
    {
      id: '3',
      title: '回收站地图加载缓慢',
      content: '使用回收站地图功能时，地图加载非常缓慢，有时还会出现定位不准确的情况。设备：iPhone 14 Pro，iOS 版本17.0。',
      type: 'bug',
      status: 'pending',
      createTime: '2025-05-15 14:20',
      images: [
        'https://via.placeholder.com/150/F44336/FFFFFF?text=Error'
      ]
    }
  ],
  faq: [
    {
      id: '1',
      question: '如何进行垃圾分类？',
      answer: '您可以通过以下方式进行垃圾分类：\n1. 使用首页的分类查询功能，输入垃圾名称即可获取分类信息。\n2. 使用智能识别功能，上传垃圾图片进行AI识别。\n3. 查阅分类指南，了解各类垃圾的特征和处理方法。',
      category: 'usage'
    },
    {
      id: '2',
      question: '如何找到附近的回收站？',
      answer: '在"回收站地图"页面，系统会自动定位您的位置并显示附近的回收站。您可以通过筛选功能查找特定类型的回收站，也可以通过搜索功能查找特定地址附近的回收站。',
      category: 'usage'
    },
    {
      id: '3',
      question: '积分如何获取和使用？',
      answer: '积分获取方式：\n1. 完成回收任务\n2. 参与环保活动\n3. 邀请好友注册\n\n积分可在"积分商城"兑换环保商品或优惠券。',
      category: 'points'
    }
  ]
};

// 如果后端API还没准备好，可以使用以下mock函数替代上面的函数
// 模拟提交反馈
export function mockSubmitFeedback(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '反馈提交成功',
        data: {
          id: String(Date.now()),
          ...data,
          status: 'pending',
          createTime: new Date().toLocaleString()
        }
      });
    }, 500);
  });
}

// 模拟获取反馈列表
export function mockGetFeedbackList() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '获取成功',
        data: mockFeedbackData.list
      });
    }, 500);
  });
} 