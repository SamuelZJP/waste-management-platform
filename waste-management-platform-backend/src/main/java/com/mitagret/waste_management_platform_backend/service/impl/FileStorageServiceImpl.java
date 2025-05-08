package com.mitagret.waste_management_platform_backend.service.impl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.mitagret.waste_management_platform_backend.service.FileStorageService;

import lombok.extern.slf4j.Slf4j;

/**
 * 文件存储服务实现类
 */
@Service
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload.image-path}")
    private String uploadPath;
    
    @Value("${file.upload.create-dir:true}")
    private boolean createDir;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Override
    public String saveFile(MultipartFile file, String subDir) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }
        
        try {
            // 获取基础存储路径
            String basePath = uploadPath;
            
            // 如果提供了子目录，则添加到路径中
            if (StringUtils.hasText(subDir)) {
                basePath = Paths.get(basePath, subDir).toString();
            }
            
            // 添加日期目录
            String dateDir = LocalDateTime.now().format(DATE_FORMATTER);
            basePath = Paths.get(basePath, dateDir).toString();
            
            // 创建文件夹（如果不存在）
            Path dirPath = Paths.get(basePath);
            if (createDir && !Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
                log.info("创建目录: {}", dirPath);
            }
            
            // 获取原始文件名和扩展名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            // 生成唯一文件名
            String newFilename = UUID.randomUUID().toString() + extension;
            
            // 构建完整的文件路径
            Path filePath = Paths.get(basePath, newFilename);
            
            // 保存文件
            Files.copy(file.getInputStream(), filePath);
            log.info("文件保存成功: {}", filePath);
            
            // 返回相对路径，用于访问
            return Paths.get(uploadPath).relativize(filePath).toString().replace("\\", "/");
            
        } catch (IOException e) {
            log.error("文件保存失败", e);
            throw new Exception("文件保存失败: " + e.getMessage());
        }
    }

    @Override
    public String saveFile(MultipartFile file) throws Exception {
        return saveFile(file, null);
    }
} 