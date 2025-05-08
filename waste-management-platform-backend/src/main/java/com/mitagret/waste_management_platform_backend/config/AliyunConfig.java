package com.mitagret.waste_management_platform_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.aliyun.imagerecog20190930.Client;
import com.aliyun.teaopenapi.models.Config;

import lombok.Data;

/**
 * 阿里云配置类
 */
@Configuration
@Data
public class AliyunConfig {

    @Value("${aliyun.access-key-id:PLACEHOLDER_ACCESS_KEY_ID}")
    private String accessKeyId;

    @Value("${aliyun.access-key-secret:PLACEHOLDER_ACCESS_KEY_SECRET}")
    private String accessKeySecret;

    @Value("${aliyun.image-recog.endpoint:imagerecog.cn-shanghai.aliyuncs.com}")
    private String imageRecogEndpoint;

    /**
     * 初始化阿里云图像识别客户端
     */
    @Bean
    public Client imageRecogClient() throws Exception {
        Config config = new Config()
                .setAccessKeyId(accessKeyId)
                .setAccessKeySecret(accessKeySecret);
        config.endpoint = imageRecogEndpoint;
        return new Client(config);
    }
} 