import MainLayout from '@/layouts/MainLayout.vue';
import BlankLayout from '@/layouts/BlankLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';

export default [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/components/map/Map.vue'),
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
      }
    ]
  },
  // 管理员未登录路由
  {
    path: '/admin',
    component: BlankLayout,
    children: [
      {
        path: 'login',
        name: 'AdminLogin',
        component: () => import('@/views/admin/LoginPage.vue'),
        meta: { title: '管理员登录' }
      },
      {
        path: 'register',
        name: 'AdminRegister',
        component: () => import('@/views/admin/RegisterPage.vue'),
        meta: { title: '管理员注册' }
      }
    ]
  },
  // 管理员已登录路由
  {
    path: '/admin',
    component: AdminLayout,
    // meta: { requiresAdminAuth: true }, // 未来添加权限验证
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/DashboardPage.vue'),
        meta: { title: '控制台' }
      },
      // 垃圾站管理路由
      {
        path: 'stations/map',
        name: 'AdminStationsMap',
        component: () => import('@/views/admin/stations/MapPage.vue'),
        meta: { title: '垃圾站地图' }
      },
      {
        path: 'stations/status',
        name: 'AdminStationsStatus',
        component: () => import('@/views/admin/stations/StatusPage.vue'),
        meta: { title: '垃圾站状态监控' }
      },
      {
        path: 'stations/issues',
        name: 'AdminStationsIssues',
        component: () => import('@/views/admin/stations/IssuesPage.vue'),
        meta: { title: '垃圾站异常处理' }
      },
      {
        path: 'stations/:id',
        name: 'AdminStationDetail',
        component: () => import('@/views/admin/stations/DetailPage.vue'),
        meta: { title: '垃圾站详情' }
      },
      // 通知管理路由
      {
        path: 'notifications',
        name: 'AdminNotifications',
        component: () => import('@/views/admin/notifications/ListPage.vue'),
        meta: { title: '通知消息' }
      },
      {
        path: 'notifications/:id',
        name: 'AdminNotificationDetail',
        component: () => import('@/views/admin/notifications/DetailPage.vue'),
        meta: { title: '通知详情' }
      },
      // 数据统计路由
      {
        path: 'statistics',
        name: 'AdminStatistics',
        component: () => import('@/views/admin/data/StatisticsPage.vue'),
        meta: { title: '数据统计' }
      },
      // 用户管理路由
      {
        path: 'users/list',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users/ListPage.vue'),
        meta: { title: '居民用户管理' }
      },
      {
        path: 'users/detail/:id',
        name: 'AdminUserDetail',
        component: () => import('@/views/admin/users/DetailPage.vue'),
        meta: { title: '用户详情' }
      },
      // 管理员管理路由
      {
        path: 'admins/list',
        name: 'AdminAdmins',
        component: () => import('@/views/admin/users/AdminListPage.vue'),
        meta: { title: '管理员用户管理' }
      },
      // 任务管理路由
      {
        path: 'tasks',
        name: 'AdminTasks',
        component: () => import('@/views/admin/tasks/ListPage.vue'),
        meta: { title: '任务管理' }
      },
      // 问题反馈路由
      {
        path: 'issues',
        name: 'AdminFeedback',
        component: () => import('@/views/admin/feedback/ListPage.vue'),
        meta: { title: '问题反馈' }
      },
      // 系统设置路由
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('@/views/admin/settings/SettingsPage.vue'),
        meta: { title: '系统设置' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
    meta: { title: '页面不存在' }
  }
]; 