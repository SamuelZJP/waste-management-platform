import MainLayout from '@/layouts/MainLayout.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';

export default [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/HomePage.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'waste/search',
        name: 'WasteSearch',
        component: () => import('@/views/waste/SearchPage.vue'),
        meta: { title: '垃圾分类查询' }
      },
      {
        path: 'waste/recognize',
        name: 'WasteRecognize',
        component: () => import('@/views/waste/RecognizePage.vue'),
        meta: { title: '垃圾识别' }
      },
    //   {
    //     path: 'waste/detail/:id',
    //     name: 'WasteDetail',
    //     component: () => import('@/views/waste/DetailPage.vue'),
    //     meta: { title: '垃圾详情' }
    //   },
      {
        path: 'recycle/map',
        name: 'RecycleMap',
        component: () => import('@/views/recycle/MapPage.vue'),
        meta: { title: '回收站地图' }
      },
      {
        path: 'recycle/detail/:id',
        name: 'RecycleDetail',
        component: () => import('@/views/recycle/DetailPage.vue'),
        meta: { title: '回收站详情' }
      },
      {
        path: 'user/profile',
        name: 'UserProfile',
        component: () => import('@/views/user/ProfilePage.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'notification/list',
        name: 'NotificationList',
        component: () => import('@/views/notification/NotificationListPage.vue'),
        meta: { title: '通知列表' }
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/feedback/FeedbackPage.vue'),
        meta: { title: '问题反馈' }
      }
    ]
  },
  {
    path: '/user',
    component: BlankLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/user/LoginPage.vue'),
        meta: { title: '登录' }
      },
    //   {
    //     path: 'register',
    //     name: 'Register',
    //     component: () => import('@/views/user/RegisterPage.vue'),
    //     meta: { title: '注册' }
    //   }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: '页面不存在' }
  }
]; 