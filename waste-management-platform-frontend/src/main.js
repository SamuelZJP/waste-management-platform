import './assets/styles/global.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import BaiduMap from 'vue-baidu-map-3x'
import Echarts from 'vue-echarts'
import * as echarts from 'echarts'

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.component('e-charts',Echarts)

app.config.globalProperties.$echarts = echarts

// 使用路由和Element Plus
app.use(router)
app.use(ElementPlus, { size: 'default', zIndex: 3000 })
app.use(BaiduMap, {
  ak: '9jFQ71HDXSRknzpwToVtwsVtkc6EZJGg',
})
app.use(echarts);
// 挂载应用
app.mount('#app')
