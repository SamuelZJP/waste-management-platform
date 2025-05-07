/**
 * 垃圾分类相关模拟数据
 */

// 垃圾分类数据
export const wasteCategories = [
  { id: 1, name: '可回收物', color: '#2F54EB', icon: 'recycle' },
  { id: 2, name: '厨余垃圾', color: '#52C41A', icon: 'food' },
  { id: 3, name: '有害垃圾', color: '#F5222D', icon: 'danger' },
  { id: 4, name: '其他垃圾', color: '#722ED1', icon: 'other' }
];

// 常见垃圾项目
export const wasteItems = [
  {
    id: 1,
    name: '塑料瓶',
    category: '可回收物',
    description: '常见的饮料包装',
    disposalMethod: '清空内容物，压扁后投入可回收物箱',
    imageUrl: '/src/assets/images/waste/plastic-bottle.svg'
  },
  {
    id: 2,
    name: '废纸',
    category: '可回收物',
    description: '各类纸张',
    disposalMethod: '平整叠放，有纸张分类的地区需按照要求分类',
    imageUrl: '/src/assets/images/waste/paper.svg'
  },
  {
    id: 3,
    name: '菜叶',
    category: '厨余垃圾',
    description: '各类蔬菜废弃物',
    disposalMethod: '沥干水分后投入厨余垃圾桶',
    imageUrl: '/src/assets/images/waste/vegetable.svg'
  },
  {
    id: 4,
    name: '果皮',
    category: '厨余垃圾',
    description: '各类水果皮',
    disposalMethod: '沥干水分后投入厨余垃圾桶',
    imageUrl: '/src/assets/images/waste/fruit-peel.svg'
  },
  {
    id: 5,
    name: '废电池',
    category: '有害垃圾',
    description: '干电池、纽扣电池等',
    disposalMethod: '投入有害垃圾专用收集容器',
    imageUrl: '/src/assets/images/waste/battery.svg'
  },
  {
    id: 6,
    name: '过期药品',
    category: '有害垃圾',
    description: '过期、失效、变质的药品',
    disposalMethod: '投入有害垃圾专用收集容器',
    imageUrl: '/src/assets/images/waste/medicine.svg'
  },
  {
    id: 7,
    name: '烟蒂',
    category: '其他垃圾',
    description: '香烟过滤嘴',
    disposalMethod: '熄灭后投入其他垃圾桶',
    imageUrl: '/src/assets/images/waste/cigarette.svg'
  },
  {
    id: 8,
    name: '一次性餐具',
    category: '其他垃圾',
    description: '一次性筷子、勺子等',
    disposalMethod: '投入其他垃圾桶',
    imageUrl: '/src/assets/images/waste/disposable.svg'
  }
];

// 垃圾识别结果
export const recognizeResult = {
  code: 200,
  message: '识别成功',
  data: {
    recognizeId: 1,
    imageUrl: '/src/assets/images/waste/plastic-bottle.svg',
    result: '可回收物',
    accuracy: 0.95,
    wasteItem: {
      id: 1,
      name: '塑料瓶',
      category: '可回收物',
      description: '常见的饮料包装',
      disposalMethod: '清空内容物，压扁后投入可回收物箱'
    }
  },
  timestamp: new Date().getTime()
};

// 搜索结果
export const searchResult = {
  code: 200,
  message: 'success',
  data: {
    items: [
      {
        id: 1,
        name: '塑料瓶',
        category: '可回收物',
        description: '常见的饮料包装',
        disposalMethod: '清空内容物，压扁后投入可回收物箱'
      },
      {
        id: 2,
        name: '废纸',
        category: '可回收物',
        description: '各类纸张',
        disposalMethod: '平整叠放，有纸张分类的地区需按照要求分类'
      }
    ],
    total: 2
  },
  timestamp: new Date().getTime()
}; 