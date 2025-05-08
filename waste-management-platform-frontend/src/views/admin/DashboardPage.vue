<template>
  <div class="dashboard-page">
    <el-row :gutter="20" class="welcome-section">
      <el-col :span="24">
        <div class="welcome-card">
          <div class="welcome-info">
            <h2>欢迎回来，{{ adminInfo.name || '管理员' }}</h2>
            <p class="station-info">{{ adminInfo.communityName || '社区物业管理中心' }} - 智能垃圾管理平台</p>
            <p class="time-info">{{ currentDate }} {{ currentTime }} {{ getWeekDay() }}</p>
          </div>
          <div class="welcome-actions">
            <el-button type="primary" @click="refreshData">刷新数据</el-button>
            <el-button @click="showHelp">帮助指南</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 垃圾站选择器 -->
    <el-row :gutter="20" class="station-select-section">
      <el-col :span="24">
        <el-card shadow="hover" class="station-select-card">
          <div class="station-select-header">
            <h3>辖区垃圾站管理</h3>
            <el-select 
              v-model="selectedStationId" 
              placeholder="选择要查看的垃圾站" 
              @change="handleStationChange"
              style="width: 220px"
              filterable
            >
              <el-option label="全部垃圾站" value="all" />
              <el-option 
                v-for="station in communityStations" 
                :key="station.id" 
                :label="station.name" 
                :value="station.id" 
              />
            </el-select>
          </div>
          
          <el-row :gutter="16" class="station-summary">
            <el-col :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
              <div class="summary-item">
                <div class="summary-value">{{ stationSummary.total }}</div>
                <div class="summary-label">垃圾站总数</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
              <div class="summary-item">
                <div class="summary-value">{{ stationSummary.online }}</div>
                <div class="summary-label">正常运行</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
              <div class="summary-item warning">
                <div class="summary-value">{{ stationSummary.warning }}</div>
                <div class="summary-label">预警状态</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="6" :md="6" :lg="3" :xl="3">
              <div class="summary-item danger">
                <div class="summary-value">{{ stationSummary.offline }}</div>
                <div class="summary-label">离线/故障</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <div class="action-buttons">
                <el-button type="primary" size="small" @click="goToStationMap">
                  <el-icon><Location /></el-icon>查看垃圾站分布
                </el-button>
                <el-button type="success" size="small" @click="goToStationStatus">
                  <el-icon><Monitor /></el-icon>状态监控
                </el-button>
                <el-button type="warning" size="small" @click="handleIssues">
                  <el-icon><Warning /></el-icon>处理异常
                </el-button>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stats-card today-card">
          <div class="stats-header">
            <div class="stats-title">今日回收总量</div>
            <el-icon><Opportunity /></el-icon>
          </div>
          <div class="stats-value">{{ todayStats.weight }} kg</div>
          <div class="stats-footer">
            <div class="stats-trend" :class="{'is-increase': todayStats.trend > 0, 'is-decrease': todayStats.trend < 0}">
              <el-icon v-if="todayStats.trend > 0"><CaretTop /></el-icon>
              <el-icon v-if="todayStats.trend < 0"><CaretBottom /></el-icon>
              <span>{{ Math.abs(todayStats.trend) }}%</span>
            </div>
            <div class="stats-compare">同比昨日</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stats-card users-card">
          <div class="stats-header">
            <div class="stats-title">今日参与居民</div>
            <el-icon><User /></el-icon>
          </div>
          <div class="stats-value">{{ todayStats.users }}</div>
          <div class="stats-footer">
            <div class="stats-trend" :class="{'is-increase': todayStats.usersTrend > 0, 'is-decrease': todayStats.usersTrend < 0}">
              <el-icon v-if="todayStats.usersTrend > 0"><CaretTop /></el-icon>
              <el-icon v-if="todayStats.usersTrend < 0"><CaretBottom /></el-icon>
              <span>{{ Math.abs(todayStats.usersTrend) }}%</span>
            </div>
            <div class="stats-compare">同比昨日</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stats-card capacity-card">
          <div class="stats-header">
            <div class="stats-title">平均容量水平</div>
            <el-icon><Histogram /></el-icon>
          </div>
          <div class="stats-value">{{ stationStats.avgCapacity }}%</div>
          <div class="stats-footer">
            <el-progress 
              :percentage="stationStats.avgCapacity" 
              :status="getCapacityStatus(stationStats.avgCapacity)"
              :stroke-width="8"
            />
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
        <el-card shadow="hover" class="stats-card feedback-card">
          <div class="stats-header">
            <div class="stats-title">待处理问题</div>
            <el-icon><Comment /></el-icon>
          </div>
          <div class="stats-value">{{ stationStats.pendingIssues }}</div>
          <div class="stats-footer">
            <el-button type="primary" link @click="goToIssues">查看详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 垃圾分类占比和回收统计 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>垃圾分类占比</h3>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- 替换占位图为echarts组件 -->
            <e-charts
              :option="pieChartOption"
              style="width: 100%; height: 100%;"
              autoresize
            />
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>近7天回收趋势</h3>
              <el-button type="primary" link @click="showDetailedStats">
                详细统计 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="chart-container">
            <!-- 替换占位图为echarts组件 -->
            <e-charts
              :option="lineChartOption"
              style="width: 100%; height: 100%;"
              autoresize
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 异常站点和设备状态 -->
    <el-row :gutter="20" class="status-section">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="station-status-card">
          <template #header>
            <div class="card-header">
              <h3>需关注的垃圾站</h3>
              <el-button type="primary" link @click="viewAllStations">
                查看全部
              </el-button>
            </div>
          </template>
          <div class="station-list">
            <div 
              v-for="station in warningStations" 
              :key="station.id" 
              class="station-item"
              :class="{'is-critical': station.statusType === 'danger'}"
            >
              <div class="station-info">
                <div class="station-name">{{ station.name }}</div>
                <div class="station-address">{{ station.address }}</div>
              </div>
              <div class="station-status">
                <el-tag 
                  :type="station.statusType" 
                  effect="light"
                >
                  {{ station.statusText }}
                </el-tag>
              </div>
              <div class="station-actions">
                <el-button link type="primary" @click="viewStationDetail(station)">查看</el-button>
              </div>
            </div>
            <div v-if="warningStations.length === 0" class="empty-list">
              <el-empty description="暂无异常垃圾站" />
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="device-card">
          <template #header>
            <div class="card-header">
              <h3>设备状态</h3>
              <el-button type="primary" link @click="refreshDevices">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="device-list">
            <div 
              v-for="device in devices" 
              :key="device.id" 
              class="device-item"
            >
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-location">{{ device.stationName }} - {{ device.type }}</div>
              </div>
              <div class="device-status">
                <el-tag 
                  :type="getDeviceStatusType(device.status)" 
                  effect="light"
                >
                  {{ getDeviceStatusText(device.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 底部任务和通知 -->
    <el-row :gutter="20" class="events-section">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="events-card">
          <template #header>
            <div class="card-header">
              <h3>今日任务</h3>
              <el-button type="primary" link @click="viewAllTasks">查看全部</el-button>
            </div>
          </template>
          <div class="events-list">
            <el-timeline>
              <el-timeline-item
                v-for="task in tasks"
                :key="task.id"
                :timestamp="task.time"
                :type="task.priority"
              >
                <div class="event-content">
                  <div class="event-title">{{ task.title }}</div>
                  <div class="event-description">{{ task.description }}</div>
                  <div class="task-actions">
                    <el-button size="small" type="primary" @click="completeTask(task)" :disabled="task.completed">
                      {{ task.completed ? '已完成' : '标记完成' }}
                    </el-button>
                  </div>
                </div>
              </el-timeline-item>
              <div v-if="tasks.length === 0" class="empty-list">
                <el-empty description="今日暂无待处理任务" />
              </div>
            </el-timeline>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card shadow="hover" class="notify-card">
          <template #header>
            <div class="card-header">
              <h3>通知消息</h3>
              <el-button type="primary" link @click="viewAllNotifications">查看全部</el-button>
            </div>
          </template>
          <div class="notify-list">
            <div 
              v-for="notification in notifications" 
              :key="notification.id" 
              class="notify-item"
              :class="{'is-unread': !notification.isRead}"
            >
              <div class="notify-icon" :class="notification.type">
                <el-icon v-if="notification.type === 'warning'"><WarningFilled /></el-icon>
                <el-icon v-else-if="notification.type === 'success'"><SuccessFilled /></el-icon>
                <el-icon v-else-if="notification.type === 'info'"><InfoFilled /></el-icon>
                <el-icon v-else><Bell /></el-icon>
              </div>
              <div class="notify-content">
                <div class="notify-title">{{ notification.title }}</div>
                <div class="notify-time">{{ notification.time }}</div>
              </div>
              <div class="notify-actions">
                <el-button link type="primary" @click="viewNotification(notification)">查看</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 帮助指南对话框 -->
    <el-dialog
      v-model="helpDialogVisible"
      title="物业管理员控制台使用指南"
      width="60%"
    >
      <div class="help-content">
        <h4>欢迎使用物业管理员控制台</h4>
        <p>作为物业管理员，您可以管理辖区内的所有智能垃圾站。以下是各功能的简要说明：</p>
        <ol>
          <li><strong>仪表盘</strong>：展示辖区内各垃圾站综合数据</li>
          <li><strong>垃圾站管理</strong>：管理辖区内所有垃圾站设备和状态</li>
          <li><strong>数据统计</strong>：查看垃圾分类和回收数据报表</li>
          <li><strong>居民管理</strong>：查看社区居民参与情况</li>
          <li><strong>任务处理</strong>：安排和处理垃圾站日常维护任务</li>
          <li><strong>问题反馈</strong>：处理居民提交的问题和建议</li>
          <li><strong>系统设置</strong>：配置系统参数和个人信息</li>
        </ol>
        <p>如需更详细的使用指南，请点击下方链接下载完整手册。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="helpDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadManual">下载完整手册</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Opportunity, User, Histogram, Comment, 
  CaretTop, CaretBottom, Refresh, WarningFilled, 
  SuccessFilled, InfoFilled, Bell, Location,
  Monitor, Warning, ArrowRight
} from '@element-plus/icons-vue';
import { 
  getAdminDashboardData, 
  getDeviceStatus,
  getAdminNotifications,
  getCommunityStations,
  getWarningStations,
  getTodayTasks
} from '@/services/adminService';
import VChart from 'vue-echarts';

const router = useRouter();
const helpDialogVisible = ref(false);
const chartTimeRange = ref('week');
const selectedStationId = ref('all'); // 默认查看全部垃圾站

// 获取最近7天日期
const getLastSevenDays = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    dates.push(`${month}/${day}`);
  }
  return dates;
};

// 管理员信息
const adminInfo = reactive({
  id: '1',
  name: '管理员',
  avatar: '/src/assets/images/avatar-admin.svg',
  communityId: '1',
  communityName: '上海财经大学浙江学院',
  role: 'property_admin'
});

// 社区内的垃圾站信息
const communityStations = ref([
  { id: '1', name: '1号楼垃圾站', status: 'normal', address: '小区东北角1号楼旁' },
  { id: '2', name: '3号楼垃圾站', status: 'normal', address: '小区中心3号楼旁' },
  { id: '3', name: '5号楼垃圾站', status: 'warning', address: '小区西南角5号楼旁' },
  { id: '4', name: '7号楼垃圾站', status: 'error', address: '小区东南角7号楼旁' },
  { id: '5', name: '9号楼垃圾站', status: 'normal', address: '小区西北角9号楼旁' },
  { id: '6', name: '11号楼垃圾站', status: 'normal', address: '小区北门11号楼旁' }
]);

// 垃圾站状态汇总
const stationSummary = reactive({
  total: 6,
  online: 4,
  warning: 1,
  offline: 1
});

// 需要关注的垃圾站（预警或故障状态）
const warningStations = ref([
  { 
    id: '3', 
    name: '5号楼垃圾站', 
    address: '小区西南角5号楼旁',
    statusType: 'warning',
    statusText: '容量预警',
    capacity: 85
  },
  { 
    id: '4', 
    name: '7号楼垃圾站', 
    address: '小区东南角7号楼旁',
    statusType: 'danger',
    statusText: '设备故障',
    capacity: 65
  }
]);

// 今日数据统计
const todayStats = reactive({
  weight: 356.5,
  trend: 8.3,
  users: 67,
  usersTrend: 12.5
});

// 垃圾站统计
const stationStats = reactive({
  avgCapacity: 62,
  pendingIssues: 3
});

// 设备列表
const devices = ref([
  { id: '1', name: '压缩设备-A1', type: '垃圾压缩机', status: 'normal', stationName: '1号楼垃圾站' },
  { id: '2', name: '分类设备-B1', type: '智能分类器', status: 'warning', stationName: '3号楼垃圾站' },
  { id: '3', name: '监控设备-C1', type: '摄像头', status: 'normal', stationName: '5号楼垃圾站' },
  { id: '4', name: '称重设备-D1', type: '电子秤', status: 'error', stationName: '7号楼垃圾站' },
  { id: '5', name: '环境监测-E1', type: '空气质量检测仪', status: 'normal', stationName: '9号楼垃圾站' }
]);

// 今日任务
const tasks = ref([
  { 
    id: '1', 
    title: '7号楼垃圾站设备维修', 
    description: '称重设备-D1出现故障，请安排维修人员前往处理',
    time: '10:30',
    priority: 'danger',
    completed: false
  },
  { 
    id: '2', 
    title: '5号楼垃圾站清运', 
    description: '塑料回收区容量已达85%，请安排清运',
    time: '11:45',
    priority: 'warning',
    completed: false
  },
  { 
    id: '3', 
    title: '小区垃圾分类宣传活动', 
    description: '今日下午3点在小区广场举办垃圾分类宣传活动',
    time: '15:00',
    priority: 'info',
    completed: false
  }
]);

// 通知消息
const notifications = ref([
  { 
    id: '1', 
    title: '7号楼垃圾站设备故障', 
    time: '30分钟前',
    type: 'warning',
    isRead: false
  },
  { 
    id: '2', 
    title: '本月垃圾回收数据报表已生成', 
    time: '1小时前',
    type: 'success',
    isRead: true
  },
  { 
    id: '3', 
    title: '新的居民反馈需处理', 
    time: '昨天 16:30',
    type: 'info',
    isRead: true
  },
  { 
    id: '4', 
    title: '系统更新通知', 
    time: '2天前',
    type: 'info',
    isRead: true
  }
]);

// 计算当前日期和时间
const currentDate = computed(() => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
});

const currentTime = computed(() => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
});

const getWeekDay = () => {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekDays[new Date().getDay()];
};

// 获取容量状态
const getCapacityStatus = (capacity) => {
  if (capacity >= 90) return 'exception';
  if (capacity >= 70) return 'warning';
  return 'success';
};

// 获取设备状态类型
const getDeviceStatusType = (status) => {
  switch (status) {
    case 'normal': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    default: return 'info';
  }
};

// 获取设备状态文本
const getDeviceStatusText = (status) => {
  switch (status) {
    case 'normal': return '正常';
    case 'warning': return '警告';
    case 'error': return '故障';
    default: return '未知';
  }
};

// 饼图配置
const pieChartOption = computed(() => {
  return {
    title: {
      text: '垃圾分类占比',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      top: 'center',
      data: ['厨余垃圾', '可回收物', '有害垃圾', '其他垃圾']
    },
    series: [
      {
        name: '垃圾分类',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1048, name: '厨余垃圾' },
          { value: 735, name: '可回收物' },
          { value: 580, name: '有害垃圾' },
          { value: 484, name: '其他垃圾' }
        ]
      }
    ]
  };
});

// 折线图配置
const lineChartOption = computed(() => {
  // 生成近7天的日期标签
  const dateLabels = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    dateLabels.push(`${date.getMonth() + 1}/${date.getDate()}`);
  }
  
  return {
    title: {
      text: '近7天回收趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['厨余垃圾', '可回收物', '有害垃圾', '其他垃圾', '总量'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dateLabels
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} kg'
      }
    },
    series: [
      {
        name: '厨余垃圾',
        type: 'line',
        stack: 'Total',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true
      },
      {
        name: '可回收物',
        type: 'line',
        stack: 'Total',
        data: [220, 182, 191, 234, 290, 330, 310],
        smooth: true
      },
      {
        name: '有害垃圾',
        type: 'line',
        stack: 'Total',
        data: [50, 32, 21, 54, 30, 10, 20],
        smooth: true
      },
      {
        name: '其他垃圾',
        type: 'line',
        stack: 'Total',
        data: [320, 332, 301, 334, 390, 330, 320],
        smooth: true
      },
      {
        name: '总量',
        type: 'line',
        stack: 'Total',
        data: [710, 678, 614, 756, 800, 900, 860],
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowBlur: 10,
          shadowOffsetY: 8
        },
        symbolSize: 8,
        smooth: true
      }
    ]
  };
});

// 更新图表时间范围
watch(chartTimeRange, (value) => {
  // 可以根据时间范围更新饼图数据
  // 实际项目中应调用API获取不同时间范围的数据
  console.log('图表时间范围变化:', value);
});

// 处理垃圾站选择变更
const handleStationChange = async (stationId) => {
  try {
    // 如果选择了特定垃圾站，则加载该垃圾站的详细数据
    if (stationId !== 'all') {
      const res = await getAdminDashboardData({ stationId });
      if (res.code === 200) {
        // 更新特定垃圾站的数据
        Object.assign(todayStats, res.data.todayStats);
        Object.assign(stationStats, {
          avgCapacity: res.data.stationStats.capacity,
          pendingIssues: res.data.stationStats.pendingIssues
        });
      }
    } else {
      // 加载全部垃圾站的汇总数据
      refreshData();
    }
  } catch (error) {
    console.error('获取垃圾站数据失败:', error);
  }
};

// 刷新仪表盘数据
const refreshData = async () => {
  try {
    const res = await getAdminDashboardData({ communityId: adminInfo.communityId });
    if (res.code === 200) {
      // 更新数据
      Object.assign(todayStats, res.data.todayStats);
      Object.assign(stationStats, res.data.stationStats);
      
      // 更新垃圾站汇总信息
      if (res.data.stationSummary) {
        Object.assign(stationSummary, res.data.stationSummary);
      }
    }
  } catch (error) {
    console.error('获取数据失败:', error);
  }
};

// 加载社区内垃圾站
const loadCommunityStations = async () => {
  try {
    const res = await getCommunityStations({ communityId: adminInfo.communityId });
    if (res.code === 200) {
      communityStations.value = res.data;
      
      // 更新垃圾站数量统计
      stationSummary.total = res.data.length;
      stationSummary.online = res.data.filter(s => s.status === 'normal').length;
      stationSummary.warning = res.data.filter(s => s.status === 'warning').length;
      stationSummary.offline = res.data.filter(s => s.status === 'error').length;
    }
  } catch (error) {
    console.error('获取社区垃圾站失败:', error);
  }
};

// 加载需关注的垃圾站
const loadWarningStations = async () => {
  try {
    const res = await getWarningStations({ communityId: adminInfo.communityId });
    if (res.code === 200) {
      warningStations.value = res.data;
    }
  } catch (error) {
    console.error('获取预警垃圾站失败:', error);
  }
};

// 刷新设备状态
const refreshDevices = async () => {
  try {
    const params = selectedStationId.value !== 'all' 
      ? { stationId: selectedStationId.value }
      : { communityId: adminInfo.communityId };
      
    const res = await getDeviceStatus(params);
    if (res.code === 200) {
      devices.value = res.data;
    }
  } catch (error) {
    console.error('获取设备状态失败:', error);
  }
};

// 加载今日任务
const loadTasks = async () => {
  try {
    const res = await getTodayTasks({ communityId: adminInfo.communityId });
    if (res.code === 200) {
      tasks.value = res.data;
    }
  } catch (error) {
    console.error('获取今日任务失败:', error);
  }
};

// 完成任务
const completeTask = (task) => {
  task.completed = true;
  // 实际项目中应调用API更新任务状态
};

// 加载通知消息
const loadNotifications = async () => {
  try {
    const res = await getAdminNotifications({ page: 1, limit: 4 });
    if (res.code === 200) {
      notifications.value = res.data.list.map(item => ({
        ...item,
        time: formatNotificationTime(item.time)
      }));
    }
  } catch (error) {
    console.error('获取通知消息失败:', error);
  }
};

// 格式化通知时间为相对时间
const formatNotificationTime = (timeStr) => {
  const now = new Date();
  const notificationTime = new Date(timeStr);
  const diffMs = now - notificationTime;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 3) {
    return `${diffDays}天前`;
  } else {
    const month = notificationTime.getMonth() + 1;
    const day = notificationTime.getDate();
    const hour = notificationTime.getHours();
    const minute = notificationTime.getMinutes();
    return `${month}-${day} ${hour}:${minute}`;
  }
};

// 跳转到垃圾站地图
const goToStationMap = () => {
  router.push('/admin/stations/map');
};

// 跳转到垃圾站状态监控
const goToStationStatus = () => {
  router.push('/admin/stations/status');
};

// 处理异常垃圾站
const handleIssues = () => {
  router.push('/admin/stations/issues');
};

// 显示详细统计
const showDetailedStats = () => {
  router.push('/admin/statistics');
};

// 查看垃圾站详情
const viewStationDetail = (station) => {
  router.push(`/admin/stations/${station.id}`);
};

// 显示帮助
const showHelp = () => {
  helpDialogVisible.value = true;
};

// 下载手册
const downloadManual = () => {
  // 实际项目中应该提供真实的下载链接
  window.open('/admin-manual.pdf', '_blank');
  helpDialogVisible.value = false;
};

// 跳转到问题反馈页面
const goToIssues = () => {
  router.push('/admin/issues');
};

// 查看所有垃圾站
const viewAllStations = () => {
  router.push('/admin/stations');
};

// 查看所有通知
const viewAllNotifications = () => {
  router.push('/admin/notifications');
};

// 查看所有任务
const viewAllTasks = () => {
  router.push('/admin/tasks');
};

// 查看通知详情
const viewNotification = (notification) => {
  // 标记为已读
  notification.isRead = true;
  // 查看详情
  router.push(`/admin/notifications/${notification.id}`);
};

onMounted(() => {
  // 获取初始数据
  refreshData();
  loadCommunityStations();
  loadWarningStations();
  refreshDevices();
  loadTasks();
  loadNotifications();
  
  // 模拟获取管理员信息
  // 实际项目中应从localStorage或vuex中获取
  const storedAdminInfo = localStorage.getItem('adminInfo');
  if (storedAdminInfo) {
    try {
      Object.assign(adminInfo, JSON.parse(storedAdminInfo));
    } catch (error) {
      console.error('解析管理员信息失败:', error);
    }
  }
});
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 20px;
}

.welcome-card {
  background: linear-gradient(to right, #1e88e5, #42a5f5);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.welcome-info h2 {
  font-size: 24px;
  margin: 0 0 10px 0;
}

.station-info {
  font-size: 16px;
  margin: 0 0 5px 0;
  opacity: 0.9;
}

.time-info {
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

.welcome-actions {
  display: flex;
  gap: 10px;
}

/* 垃圾站选择区域 */
.station-select-section {
  margin-bottom: 20px;
}

.station-select-card {
  padding: 0 0 16px 0;
}

.station-select-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 16px;
}

.station-select-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.station-summary {
  padding: 0 16px;
}

.summary-item {
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  height: 100%;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.summary-item.warning .summary-value {
  color: #e6a23c;
}

.summary-item.danger .summary-value {
  color: #f56c6c;
}

.summary-label {
  font-size: 12px;
  color: #606266;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

/* 统计卡片 */
.stats-section {
  margin-bottom: 20px;
}

.stats-card {
  height: 100%;
  margin-bottom: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stats-title {
  font-size: 16px;
  color: #606266;
}

.stats-value {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
}

.stats-footer {
  margin-top: 10px;
}

.stats-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
  margin-bottom: 5px;
}

.stats-trend.is-increase {
  color: #67c23a;
}

.stats-trend.is-decrease {
  color: #f56c6c;
}

.stats-compare {
  font-size: 12px;
  color: #909399;
}

/* 图表区域 */
.charts-section {
  margin-bottom: 20px;
}

.chart-card {
  height: 100%;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.chart-container {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart {
  width: 100%;
  height: 100%;
}

.mock-chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.mock-chart img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* 垃圾站状态 */
.status-section {
  margin-bottom: 20px;
}

.station-status-card,
.device-card {
  height: 100%;
  margin-bottom: 20px;
}

.station-list,
.device-list {
  max-height: 300px;
  overflow-y: auto;
}

.station-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}

.station-item:hover {
  background-color: #f5f7fa;
}

.station-item.is-critical {
  background-color: #fef0f0;
}

.station-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.station-address {
  font-size: 12px;
  color: #909399;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.device-item:last-child {
  border-bottom: none;
}

.device-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.device-location {
  font-size: 12px;
  color: #909399;
}

/* 任务和通知 */
.events-section {
  margin-bottom: 20px;
}

.events-card, 
.notify-card {
  height: 100%;
  margin-bottom: 20px;
}

.events-list {
  max-height: 400px;
  overflow-y: auto;
}

.event-content {
  padding: 0 5px;
}

.event-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.event-description {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
}

.task-actions {
  margin-top: 8px;
}

.notify-list {
  max-height: 400px;
  overflow-y: auto;
}

.notify-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}

.notify-item:hover {
  background-color: #f5f7fa;
}

.notify-item.is-unread {
  background-color: #ecf5ff;
}

.notify-icon {
  margin-right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.notify-icon.warning {
  background-color: #e6a23c;
}

.notify-icon.success {
  background-color: #67c23a;
}

.notify-icon.info {
  background-color: #909399;
}

.notify-content {
  flex: 1;
}

.notify-title {
  font-size: 14px;
  margin-bottom: 4px;
}

.notify-time {
  font-size: 12px;
  color: #909399;
}

.help-content {
  line-height: 1.6;
}

.help-content h4 {
  margin-top: 0;
}

.empty-list {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .welcome-actions {
    margin-top: 15px;
    width: 100%;
  }
  
  .welcome-actions .el-button {
    flex: 1;
  }
  
  .station-select-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .station-select-header .el-select {
    width: 100%;
  }
  
  .action-buttons {
    justify-content: center;
    margin-top: 10px;
  }
  
  .summary-item {
    margin-bottom: 10px;
  }
  
  .stats-card {
    margin-bottom: 15px;
  }
  
  .notify-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notify-icon {
    margin-bottom: 10px;
  }
  
  .notify-actions {
    margin-top: 10px;
    align-self: flex-end;
  }
}
</style> 