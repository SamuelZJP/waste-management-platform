package com.mitagret.waste_management_platform_backend.service;

import org.springframework.web.multipart.MultipartFile;

import com.mitagret.waste_management_platform_backend.model.WasteRecognizeResult;

/**
 * 垃圾识别服务接口
 */
public interface WasteRecognizeService {
    
    /**
     * 识别垃圾图片
     * @param file 图片文件
     * @return 识别结果
     */
    WasteRecognizeResult recognizeWaste(MultipartFile file) throws Exception;
} 