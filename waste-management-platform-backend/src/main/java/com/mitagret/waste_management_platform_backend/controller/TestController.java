package com.mitagret.waste_management_platform_backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class TestController {
    @GetMapping("/hello")
    public String hello() {
        return "Hello World!";
    }
    
}
