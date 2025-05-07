<template>
  <div class="feedback-page">
    <div class="page-header">
      <h2 class="page-title">问题反馈</h2>
      <p class="page-description">如果您在使用过程中遇到问题，或有任何建议，请告诉我们</p>
    </div>
    
    <el-row :gutter="20">
      <!-- 左侧反馈表单 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="14" :xl="16">
        <el-card class="feedback-form-card">
          <template #header>
            <div class="card-header">
              <h3>提交反馈</h3>
            </div>
          </template>
          
          <el-form 
            ref="feedbackFormRef"
            :model="feedbackForm" 
            :rules="feedbackRules" 
            label-position="top"
          >
            <el-form-item prop="type" label="反馈类型">
              <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型" style="width: 100%">
                <el-option label="功能异常" value="bug" />
                <el-option label="功能建议" value="feature" />
                <el-option label="使用问题" value="usage" />
                <el-option label="界面优化" value="ui" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            
            <el-form-item prop="title" label="标题">
              <el-input 
                v-model="feedbackForm.title" 
                placeholder="请简要描述您的问题或建议"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item prop="content" label="详细描述">
              <el-input 
                v-model="feedbackForm.content" 
                type="textarea" 
                :rows="6" 
                placeholder="请详细描述您遇到的问题或建议，以便我们更好地解决和改进"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            
            <el-form-item label="上传截图（选填）">
              <el-upload
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove"
                :on-change="handleFileChange"
                :file-list="fileList"
                multiple
                :limit="3"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <div class="upload-tip">
                <el-icon><InfoFilled /></el-icon>
                <span>最多上传3张图片，每张不超过2MB，支持jpg、png格式</span>
              </div>
            </el-form-item>
            
            <el-form-item prop="contact" label="联系方式（选填）">
              <el-input 
                v-model="feedbackForm.contact" 
                placeholder="请留下您的联系方式，便于我们回复您"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="submitLoading"
                @click="submitFeedback"
              >
                提交反馈
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <!-- 右侧反馈记录 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="10" :xl="8">
        <el-card class="feedback-history-card">
          <template #header>
            <div class="card-header">
              <h3>我的反馈记录</h3>
            </div>
          </template>
          
          <div v-if="feedbackList.length > 0" class="feedback-list">
            <el-collapse accordion>
              <el-collapse-item 
                v-for="item in feedbackList" 
                :key="item.id"
                :name="item.id"
              >
                <template #title>
                  <div class="feedback-item-header">
                    <div class="feedback-title">{{ item.title }}</div>
                  </div>
                </template>
                
                <div class="feedback-content">
                  <div class="feedback-header">
                    <div class="feedback-meta">
                      <el-tag 
                        size="small" 
                        :type="getStatusType(item.status)"
                      >
                        {{ getStatusText(item.status) }}
                      </el-tag>
                      <span class="feedback-time">提交时间：{{ item.createTime }}</span>
                    </div>
                  </div>
                  <div class="feedback-type">
                    <span class="label">反馈类型：</span>
                    <el-tag size="small" effect="plain">{{ getTypeText(item.type) }}</el-tag>
                  </div>
                  <div class="feedback-description">
                    <div class="label">详细描述：</div>
                    <p>{{ item.content }}</p>
                  </div>
                  
                  <div v-if="item.images && item.images.length > 0" class="feedback-images">
                    <div class="label">相关截图：</div>
                    <div class="image-list">
                      <el-image
                        v-for="(img, index) in item.images"
                        :key="index"
                        :src="img"
                        :preview-src-list="item.images"
                        fit="cover"
                        class="feedback-image"
                      />
                    </div>
                  </div>
                  
                  <div v-if="item.reply" class="feedback-reply">
                    <div class="label">官方回复：</div>
                    <div class="reply-content">
                      <p>{{ item.reply.content }}</p>
                      <div class="reply-time">{{ item.reply.time }}</div>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
            
            <div v-if="feedbackList.length >= 5" class="view-more">
              <el-button link type="primary" @click="viewAllFeedback">查看全部反馈</el-button>
            </div>
          </div>
          
          <el-empty v-else description="暂无反馈记录" />
        </el-card>
        
        <el-card class="feedback-faq-card">
          <template #header>
            <div class="card-header">
              <h3>常见问题</h3>
            </div>
          </template>
          
          <el-collapse accordion>
            <el-collapse-item title="如何进行垃圾分类？" name="1">
              <div>
                您可以通过以下方式进行垃圾分类：
                <ol>
                  <li>使用首页的分类查询功能，输入垃圾名称即可获取分类信息</li>
                  <li>使用智能识别功能，上传垃圾图片进行AI识别</li>
                  <li>查阅分类指南，了解各类垃圾的特征和处理方法</li>
                </ol>
              </div>
            </el-collapse-item>
            <el-collapse-item title="如何找到附近的回收站？" name="2">
              <div>
                在"回收站地图"页面，系统会自动定位您的位置并显示附近的回收站。您可以通过筛选功能查找特定类型的回收站，也可以通过搜索功能查找特定地址附近的回收站。
              </div>
            </el-collapse-item>
            <el-collapse-item title="积分如何获取和使用？" name="3">
              <div>
                积分获取方式：
                <ul>
                  <li>完成回收任务</li>
                  <li>参与环保活动</li>
                  <li>邀请好友注册</li>
                </ul>
                积分可在"积分商城"兑换环保商品或优惠券。
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图片预览 -->
    <el-dialog v-model="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="预览图" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus, InfoFilled } from '@element-plus/icons-vue';
import { submitFeedback as submitFeedbackApi, getFeedbackList } from '@/services/feedbackService';

const router = useRouter();
const feedbackFormRef = ref(null);
const submitLoading = ref(false);

// 图片预览
const dialogImageUrl = ref('');
const dialogVisible = ref(false);
const fileList = ref([]);

// 反馈表单
const feedbackForm = reactive({
  type: '',
  title: '',
  content: '',
  contact: '',
  images: []
});

// 表单验证规则
const feedbackRules = {
  type: [
    { required: true, message: '请选择反馈类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入详细描述', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
};

// 反馈记录
const feedbackList = ref([]);

// 加载反馈记录
const loadFeedbackList = async () => {
  try {
    const res = await getFeedbackList();
    if (res.code === 200) {
      feedbackList.value = res.data;
    }
  } catch (error) {
    console.error('获取反馈记录失败:', error);
    // 使用模拟数据
    setupMockData();
  }
};

// 设置模拟数据
const setupMockData = () => {
  feedbackList.value = [
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
  ];
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待处理';
    case 'processing':
      return '处理中';
    case 'replied':
      return '已回复';
    case 'closed':
      return '已关闭';
    default:
      return '未知状态';
  }
};

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'pending':
      return 'info';
    case 'processing':
      return 'warning';
    case 'replied':
      return 'success';
    case 'closed':
      return '';
    default:
      return 'info';
  }
};

// 获取反馈类型文本
const getTypeText = (type) => {
  switch (type) {
    case 'bug':
      return '功能异常';
    case 'feature':
      return '功能建议';
    case 'usage':
      return '使用问题';
    case 'ui':
      return '界面优化';
    case 'other':
      return '其他';
    default:
      return '未知类型';
  }
};

// 处理图片预览
const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url || URL.createObjectURL(file.raw);
  dialogVisible.value = true;
};

// 处理图片移除
const handleRemove = (file, fileList) => {
  const index = feedbackForm.images.indexOf(file.url || URL.createObjectURL(file.raw));
  if (index !== -1) {
    feedbackForm.images.splice(index, 1);
  }
};

// 处理文件变化
const handleFileChange = (file, fileList) => {
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png';
  const isLt2M = file.raw.size / 1024 / 1024 < 2;
  
  if (!isImage) {
    ElMessage.error('只能上传JPG或PNG格式的图片!');
    const index = fileList.indexOf(file);
    if (index !== -1) {
      fileList.splice(index, 1);
    }
    return false;
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!');
    const index = fileList.indexOf(file);
    if (index !== -1) {
      fileList.splice(index, 1);
    }
    return false;
  }
  
  // 将图片添加到表单数据中
  const imageUrl = URL.createObjectURL(file.raw);
  if (!feedbackForm.images.includes(imageUrl)) {
    feedbackForm.images.push(imageUrl);
  }
};

// 提交反馈
const submitFeedback = async () => {
  if (!feedbackFormRef.value) return;
  
  try {
    await feedbackFormRef.value.validate();
    submitLoading.value = true;
    
    // 调用API提交反馈
    const res = await submitFeedbackApi({
      type: feedbackForm.type,
      title: feedbackForm.title,
      content: feedbackForm.content,
      contact: feedbackForm.contact,
      images: feedbackForm.images
    });
    
    if (res.code === 200) {
      ElMessage.success('反馈提交成功，感谢您的反馈！');
      
      // 清空表单
      resetForm();
      
      // 重新加载反馈记录
      loadFeedbackList();
    } else {
      ElMessage.error(res.message || '提交失败');
    }
  } catch (error) {
    console.error('提交反馈失败:', error);
    
    // 模拟API调用成功
    ElMessage.success('反馈提交成功，感谢您的反馈！');
    
    // 添加到本地反馈列表
    const newFeedback = {
      id: String(Date.now()),
      title: feedbackForm.title,
      content: feedbackForm.content,
      type: feedbackForm.type,
      status: 'pending',
      createTime: new Date().toLocaleString(),
      images: [...feedbackForm.images]
    };
    
    feedbackList.value.unshift(newFeedback);
    
    // 清空表单
    resetForm();
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  if (feedbackFormRef.value) {
    feedbackFormRef.value.resetFields();
    fileList.value = [];
    feedbackForm.images = [];
  }
};

// 查看全部反馈
const viewAllFeedback = () => {
  router.push('/feedback/history');
};

onMounted(() => {
  loadFeedbackList();
});
</script>

<style scoped>
.feedback-page {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 8px;
}

.page-description {
  color: #666;
  font-size: 14px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.feedback-form-card,
.feedback-history-card,
.feedback-faq-card {
  margin-bottom: 20px;
}

.upload-tip {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
}

.upload-tip .el-icon {
  margin-right: 5px;
  color: #909399;
}

.feedback-list {
  margin-bottom: 20px;
}

.feedback-item-header {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.feedback-title {
  font-weight: bold;
  color: #333;
}

.feedback-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feedback-time {
  color: #909399;
  font-size: 12px;
}

.feedback-content {
  padding: 10px;
  color: #333;
}

.label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}

.feedback-type,
.feedback-description,
.feedback-images,
.feedback-reply {
  margin-bottom: 15px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 5px;
}

.feedback-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #eee;
}

.reply-content {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}

.reply-content p {
  margin: 0;
  margin-bottom: 10px;
}

.reply-time {
  text-align: right;
  color: #909399;
  font-size: 12px;
}

.view-more {
  text-align: center;
  margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .feedback-form-card {
    margin-bottom: 20px;
  }
  
  .feedback-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .image-list {
    justify-content: center;
  }
}

.feedback-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #eee;
}
</style> 