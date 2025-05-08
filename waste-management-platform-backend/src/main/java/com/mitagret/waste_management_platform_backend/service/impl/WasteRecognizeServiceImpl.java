package com.mitagret.waste_management_platform_backend.service.impl;

import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.aliyun.imagerecog20190930.Client;
import com.aliyun.imagerecog20190930.models.ClassifyingRubbishAdvanceRequest;
import com.aliyun.imagerecog20190930.models.ClassifyingRubbishResponse;
import com.aliyun.tea.TeaException;
import com.aliyun.teautil.Common;
import com.aliyun.teautil.models.RuntimeOptions;
import com.mitagret.waste_management_platform_backend.model.WasteItem;
import com.mitagret.waste_management_platform_backend.model.WasteRecognizeResult;
import com.mitagret.waste_management_platform_backend.service.FileStorageService;
import com.mitagret.waste_management_platform_backend.service.WasteRecognizeService;

import lombok.extern.slf4j.Slf4j;

/**
 * 垃圾识别服务实现类
 */
@Service
@Slf4j
public class WasteRecognizeServiceImpl implements WasteRecognizeService {

    @Autowired
    private Client imageRecogClient;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    // 用于生成识别ID
    private static final AtomicLong RECOGNIZE_ID_GENERATOR = new AtomicLong(1);
    
    // 垃圾类别名称映射
    private static final Map<String, String> CATEGORY_MAP = new HashMap<>();
    static {
        CATEGORY_MAP.put("可回收垃圾", "可回收物");
        CATEGORY_MAP.put("厨余垃圾", "厨余垃圾");
        CATEGORY_MAP.put("有害垃圾", "有害垃圾");
        CATEGORY_MAP.put("其他垃圾", "其他垃圾");
    }
    
    // 随机数生成器
    private static final Random RANDOM = new Random();
    
    /**
     * 垃圾分类描述信息
     */
    private static final Map<String, String> CATEGORY_DESCRIPTION = new HashMap<>();
    static {
        CATEGORY_DESCRIPTION.put("可回收物", "可回收物是指适宜回收和资源利用的生活垃圾");
        CATEGORY_DESCRIPTION.put("厨余垃圾", "厨余垃圾是指居民日常生活中产生的有机易腐垃圾");
        CATEGORY_DESCRIPTION.put("有害垃圾", "有害垃圾是指对人体健康或自然环境造成直接或潜在危害的生活垃圾");
        CATEGORY_DESCRIPTION.put("其他垃圾", "其他垃圾是指除可回收物、厨余垃圾、有害垃圾以外的其他生活垃圾");
    }
    
    /**
     * 垃圾分类处理方式信息
     */
    private static final Map<String, String> DISPOSAL_METHOD = new HashMap<>();
    static {
        DISPOSAL_METHOD.put("可回收物", "投放至可回收物收集容器，保持清洁干燥，避免污染");
        DISPOSAL_METHOD.put("厨余垃圾", "投放至厨余垃圾收集容器，沥干水分，去除包装物");
        DISPOSAL_METHOD.put("有害垃圾", "投放至有害垃圾收集容器，单独投放，避免混合");
        DISPOSAL_METHOD.put("其他垃圾", "投放至其他垃圾收集容器，尽量沥干水分");
    }

    @Override
    public WasteRecognizeResult recognizeWaste(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("图片文件不能为空");
        }
        
        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("文件类型必须为图片");
        }
        
        // 保存上传的图片到本地
        String imagePath = fileStorageService.saveFile(file, "waste");
        log.info("图片已保存至: {}", imagePath);
        
        // 获取图片字节数组
        byte[] imageBytes = file.getBytes();
        
        try {
            // 构建请求
            ClassifyingRubbishAdvanceRequest request = new ClassifyingRubbishAdvanceRequest()
                    .setImageURLObject(new ByteArrayInputStream(imageBytes));
            
            // 设置运行时选项
            RuntimeOptions runtime = new RuntimeOptions();
            
            // 调用阿里云识别API
            ClassifyingRubbishResponse response = imageRecogClient.classifyingRubbishAdvance(request, runtime);
            
            // 将响应对象转成字符串，便于调试
            String responseJson = Common.toJSONString(response);
            log.debug("阿里云识别结果: {}", responseJson);
            
            // 直接从响应对象获取JSON字符串，并手动解析
            // 解析confidence, category, rubbish等字段
            double accuracy = 0.75; // 默认值
            String category = "其他垃圾"; // 默认值
            String rubbish = "未知物品"; // 默认值
            
            // 取值处理：从完整的响应中提取所需信息
            try {
                // 使用正则表达式或字符串处理从responseJson提取所需字段
                if (responseJson != null && !responseJson.isEmpty()) {
                    log.info("开始从响应中提取数据: {}", responseJson.substring(0, Math.min(responseJson.length(), 200)) + "...");
                    
                    // 尝试提取confidence
                    java.util.regex.Pattern confPattern = java.util.regex.Pattern.compile("\"confidence\"\\s*:\\s*\"?(\\d+)\"?");
                    java.util.regex.Matcher confMatcher = confPattern.matcher(responseJson);
                    if (confMatcher.find()) {
                        accuracy = Double.parseDouble(confMatcher.group(1)) / 100.0;
                        log.info("成功提取置信度: {}", accuracy);
                    } else {
                        log.warn("未能从响应中提取置信度");
                    }
                    
                    // 尝试提取category
                    java.util.regex.Pattern catPattern = java.util.regex.Pattern.compile("\"category\"\\s*:\\s*\"([^\"]+)\"");
                    java.util.regex.Matcher catMatcher = catPattern.matcher(responseJson);
                    if (catMatcher.find()) {
                        category = catMatcher.group(1);
                        log.info("成功提取垃圾类别: {}", category);
                    } else {
                        log.warn("未能从响应中提取垃圾类别");
                    }
                    
                    // 尝试提取rubbish
                    java.util.regex.Pattern rubPattern = java.util.regex.Pattern.compile("\"rubbish\"\\s*:\\s*\"([^\"]+)\"");
                    java.util.regex.Matcher rubMatcher = rubPattern.matcher(responseJson);
                    if (rubMatcher.find()) {
                        rubbish = rubMatcher.group(1);
                        log.info("成功提取垃圾名称: {}", rubbish);
                    } else {
                        log.warn("未能从响应中提取垃圾名称");
                    }
                }
            } catch (Exception e) {
                log.warn("解析响应数据失败，使用默认值", e);
            }
            
            // 标准化垃圾类别
            String standardCategory = CATEGORY_MAP.getOrDefault(category, category);
            
            // 创建垃圾项目
            WasteItem wasteItem = WasteItem.builder()
                    .id(RANDOM.nextLong(1000) + 1)
                    .name(rubbish)
                    .category(standardCategory)
                    .description(CATEGORY_DESCRIPTION.getOrDefault(standardCategory, "未知垃圾类型"))
                    .disposalMethod(DISPOSAL_METHOD.getOrDefault(standardCategory, "请按当地垃圾分类要求处理"))
                    .build();
            
            // 创建识别结果
            return WasteRecognizeResult.builder()
                    .recognizeId(RECOGNIZE_ID_GENERATOR.getAndIncrement())
                    .imageUrl(imagePath) // 返回保存的图片路径
                    .result(standardCategory)
                    .accuracy(accuracy)
                    .wasteItem(wasteItem)
                    .build();
            
        } catch (TeaException e) {
            log.error("阿里云垃圾识别服务调用失败", e);
            throw new Exception("垃圾识别服务暂时不可用: " + e.getMessage());
        } catch (Exception e) {
            log.error("垃圾识别过程出错", e);
            throw new Exception("垃圾识别失败: " + e.getMessage());
        }
    }
} 