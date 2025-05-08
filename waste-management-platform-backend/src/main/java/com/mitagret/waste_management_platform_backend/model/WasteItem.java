package com.mitagret.waste_management_platform_backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 垃圾项目实体类
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteItem {
    
    private Long id;
    private String name;
    private String category;
    private String description;
    private String disposalMethod;
    private String imageUrl;
} 