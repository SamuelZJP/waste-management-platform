<template>
  <div class="recognize-page">
    <div class="page-header">
      <h2 class="page-title">垃圾识别</h2>
      <p class="page-description">上传垃圾图片，AI智能识别垃圾类别</p>
    </div>
    
    <div class="upload-section">
      <el-card class="upload-card">
        <div class="upload-container">
          <el-upload
            class="waste-upload"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept="image/*"
          >
            <div v-if="!imageUrl" class="upload-placeholder">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <em>点击上传</em>或拖拽图片到此处
              </div>
              <div class="upload-hint">支持JPG、PNG、JPEG格式图片</div>
            </div>
            <img v-else :src="imageUrl" class="preview-image" />
          </el-upload>
          
          <div class="upload-actions">
            <el-button 
              type="primary" 
              :disabled="!imageFile" 
              @click="startRecognize"
              :loading="recognizing"
            >
              开始识别
            </el-button>
            <el-button 
              v-if="imageUrl" 
              @click="resetUpload"
            >
              重新上传
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <div v-if="recognizeResult" class="result-section">
      <el-card class="result-card">
        <div class="result-header">
          <h3>识别结果</h3>
          <el-tag size="large" :type="getCategoryTagType(recognizeResult.wasteItem.category)">
            {{ recognizeResult.wasteItem.category }}
          </el-tag>
        </div>
        
        <div class="result-content">
          <div class="accuracy-info">
            <div class="accuracy-text">识别准确度：{{ (recognizeResult.accuracy * 100).toFixed(0) }}%</div>
            <el-progress :percentage="recognizeResult.accuracy * 100" :format="() => ''" />
          </div>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item label="垃圾名称">{{ recognizeResult.wasteItem.name }}</el-descriptions-item>
            <el-descriptions-item label="垃圾类别">{{ recognizeResult.wasteItem.category }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ recognizeResult.wasteItem.description }}</el-descriptions-item>
            <el-descriptions-item label="处理方式">{{ recognizeResult.wasteItem.disposalMethod }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>
    
    <div class="tips-section">
      <el-card class="tips-card">
        <template #header>
          <div class="tips-header">
            <h3>识别小贴士</h3>
          </div>
        </template>
        <ol class="tips-list">
          <li>保持图片清晰，拍摄时尽量保持足够的光线</li>
          <li>尽量只包含一种垃圾，多种垃圾混合可能影响识别结果</li>
          <li>尽量保持垃圾在图片中居中位置</li>
          <li>目前系统支持常见的家庭生活垃圾识别</li>
          <li>特殊垃圾请参考专业分类指南或联系环保部门</li>
        </ol>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Upload } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { recognizeWaste } from '@/services/wasteService';

const imageFile = ref(null);
const imageUrl = ref('');
const recognizing = ref(false);
const recognizeResult = ref(null);

// 根据分类获取标签类型
const getCategoryTagType = (category) => {
  switch (category) {
    case '可回收物': return 'primary';
    case '厨余垃圾': return 'success';
    case '有害垃圾': return 'danger';
    case '其他垃圾': return '';
    default: return 'info';
  }
};

// 处理文件选择
const handleFileChange = (file) => {
  const isImage = file.raw.type.startsWith('image/');
  const isLt2M = file.raw.size / 1024 / 1024 < 10;
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过10MB!');
    return false;
  }
  
  imageFile.value = file.raw;
  imageUrl.value = URL.createObjectURL(file.raw);
  recognizeResult.value = null;
};

// 重置上传
const resetUpload = () => {
  imageFile.value = null;
  imageUrl.value = '';
  recognizeResult.value = null;
};

// 开始识别
const startRecognize = async () => {
  if (!imageFile.value) {
    ElMessage.warning('请先上传图片');
    return;
  }
  
  recognizing.value = true;
  
  try {
    const formData = new FormData();
    formData.append('file', imageFile.value);
    
    const res = await recognizeWaste(formData);
    if (res.code === 200) {
      recognizeResult.value = res.data;
      ElMessage.success('识别成功');
    } else {
      ElMessage.error(res.message || '识别失败');
    }
  } catch (error) {
    console.error('识别失败:', error);
    ElMessage.error('识别失败，请稍后重试');
  } finally {
    recognizing.value = false;
  }
};
</script>

<style scoped>
.recognize-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
}

.page-description {
  font-size: 16px;
  color: #666;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-card {
  border: none;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.waste-upload {
  width: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.upload-icon {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #606266;
  margin-bottom: 6px;
}

.upload-text em {
  color: #1e88e5;
  font-style: normal;
}

.upload-hint {
  font-size: 14px;
  color: #909399;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  margin: 20px 0;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  gap: 16px;
}

.result-section {
  margin-bottom: 30px;
}

.result-card {
  border: none;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  margin: 0;
  font-size: 20px;
}

.accuracy-info {
  margin-bottom: 20px;
}

.accuracy-text {
  margin-bottom: 8px;
  font-size: 16px;
  color: #606266;
}

.tips-section {
  margin-bottom: 40px;
}

.tips-card {
  border: none;
}

.tips-header h3 {
  margin: 0;
  font-size: 18px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
}

.tips-list li {
  margin-bottom: 10px;
  color: #606266;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .upload-placeholder {
    padding: 20px 0;
  }
  
  .upload-icon {
    font-size: 36px;
  }
  
  .preview-image {
    max-height: 200px;
  }
}
</style> 