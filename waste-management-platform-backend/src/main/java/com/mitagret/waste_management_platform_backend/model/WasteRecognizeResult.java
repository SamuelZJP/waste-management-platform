package com.mitagret.waste_management_platform_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 垃圾识别结果实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteRecognizeResult {
    
    private Long recognizeId;
    private String imageUrl;
    private String result;
    private Double accuracy;
    private WasteItem wasteItem;
} 