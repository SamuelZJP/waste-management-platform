/**
 * 回收点相关模拟数据
 */

// 回收点列表
export const recyclePoints = [
  {
    id: 1,
    name: '社区回收站A',
    address: '北京市海淀区西二旗大街1号',
    longitude: 116.3154,
    latitude: 40.0542,
    openingHours: '8:00-18:00',
    wasteTypes: ['可回收物', '有害垃圾'],
    contact: '010-12345678',
    imageUrl: '/src/assets/images/recycle/point1.svg',
    distance: 500,
    capacity: 60, // 容量百分比，0-100
    status: 1 // 0:离线,1:在线,2:故障
  },
  {
    id: 2,
    name: '小区垃圾分类中心',
    address: '北京市海淀区上地三街5号',
    longitude: 116.3254,
    latitude: 40.0442,
    openingHours: '7:00-20:00',
    wasteTypes: ['可回收物', '厨余垃圾', '有害垃圾', '其他垃圾'],
    contact: '010-87654321',
    imageUrl: '/src/assets/images/recycle/point2.svg',
    distance: 800,
    capacity: 45,
    status: 1
  },
  {
    id: 3,
    name: '环保智能回收箱',
    address: '北京市朝阳区建国路88号',
    longitude: 116.4654,
    latitude: 39.9542,
    openingHours: '全天24小时',
    wasteTypes: ['可回收物'],
    contact: '13800138000',
    imageUrl: '/src/assets/images/recycle/point3.svg',
    distance: 1200,
    capacity: 80,
    status: 2
  },
  {
    id: 4,
    name: '社区回收站B',
    address: '北京市朝阳区三里屯路19号',
    longitude: 116.4554,
    latitude: 39.9342,
    openingHours: '9:00-17:00',
    wasteTypes: ['可回收物', '有害垃圾', '其他垃圾'],
    contact: '010-65432198',
    imageUrl: '/src/assets/images/recycle/point4.svg',
    distance: 1500,
    capacity: 30,
    status: 1
  }
];

// 附近回收点查询结果
export const nearbyRecyclePoints = {
  code: 200,
  message: 'success',
  data: {
    points: recyclePoints,
    total: recyclePoints.length
  },
  timestamp: new Date().getTime()
};

// 回收点详情
export const recyclePointDetail = {
  code: 200,
  message: 'success',
  data: {
    ...recyclePoints[0],
    wasteCapacity: [
      { type: '可回收物', capacity: 65 },
      { type: '厨余垃圾', capacity: 40 },
      { type: '有害垃圾', capacity: 20 },
      { type: '其他垃圾', capacity: 70 }
    ],
    lastUpdated: '2025-05-06 15:30:45',
    feedbacks: [
      { id: 1, content: '这个回收站很干净', rating: 5, createTime: '2025-05-05' },
      { id: 2, content: '工作人员很负责', rating: 4, createTime: '2025-05-04' }
    ],
    operationLogs: [
      { id: 1, operation: '清空回收箱', operator: '张三', operationTime: '2025-05-06 10:00:00' },
      { id: 2, operation: '设备维修', operator: '李四', operationTime: '2025-05-05 14:30:00' }
    ]
  },
  timestamp: new Date().getTime()
}; 