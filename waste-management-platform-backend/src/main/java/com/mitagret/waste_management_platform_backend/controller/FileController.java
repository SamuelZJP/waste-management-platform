package com.mitagret.waste_management_platform_backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.extern.slf4j.Slf4j;

/**
 * 文件控制器
 */
@Controller
@RequestMapping("/files")
@Slf4j
public class FileController {

    @Value("${file.upload.image-path}")
    private String uploadPath;
    
    /**
     * 获取上传的图片
     * 
     * @param dateDir 日期目录
     * @param fileName 文件名
     * @return 图片资源
     */
    @GetMapping("/images/waste/{dateDir}/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String dateDir, @PathVariable String fileName) {
        try {
            // 构建文件路径
            Path filePath = Paths.get(uploadPath, "waste", dateDir, fileName);
            Resource resource = new UrlResource(filePath.toUri());
            
            // 检查文件是否存在
            if (resource.exists()) {
                // 获取文件的媒体类型
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }
                
                // 返回文件资源
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                log.warn("图片文件不存在: {}", filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            log.error("获取图片文件失败", e);
            return ResponseEntity.badRequest().build();
        }
    }
} 