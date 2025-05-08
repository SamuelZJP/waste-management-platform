package com.mitagret.waste_management_platform_backend.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文件存储服务接口
 */
public interface FileStorageService {
    
    /**
     * 保存上传的文件到指定目录
     * 
     * @param file 上传的文件
     * @param subDir 子目录名称（可选）
     * @return 文件访问路径（相对路径）
     */
    String saveFile(MultipartFile file, String subDir) throws Exception;
    
    /**
     * 保存上传的文件到默认目录
     * 
     * @param file 上传的文件
     * @return 文件访问路径（相对路径）
     */
    String saveFile(MultipartFile file) throws Exception;
} 