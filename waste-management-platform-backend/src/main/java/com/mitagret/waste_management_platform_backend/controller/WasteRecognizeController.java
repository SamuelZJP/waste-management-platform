package com.mitagret.waste_management_platform_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.mitagret.waste_management_platform_backend.model.ApiResponse;
import com.mitagret.waste_management_platform_backend.model.WasteRecognizeResult;
import com.mitagret.waste_management_platform_backend.service.WasteRecognizeService;

import lombok.extern.slf4j.Slf4j;

/**
 * 垃圾识别控制器
 */
@RestController
@RequestMapping("/waste")
@Slf4j
public class WasteRecognizeController {

    @Autowired
    private WasteRecognizeService wasteRecognizeService;
    
    /**
     * 垃圾识别接口
     * @param file 垃圾图片文件
     * @return 识别结果
     */
    @PostMapping("/recognize")
    public ApiResponse<WasteRecognizeResult> recognizeWaste(@RequestParam("file") MultipartFile file) {
        try {
            log.info("接收到垃圾识别请求，文件大小: {}KB", file.getSize() / 1024);
            WasteRecognizeResult result = wasteRecognizeService.recognizeWaste(file);
            return ApiResponse.success("识别成功", result);
        } catch (IllegalArgumentException e) {
            log.warn("垃圾识别请求参数错误: {}", e.getMessage());
            return ApiResponse.error(400, e.getMessage());
        } catch (Exception e) {
            log.error("垃圾识别失败", e);
            return ApiResponse.error(500, "垃圾识别服务异常: " + e.getMessage());
        }
    }
} 