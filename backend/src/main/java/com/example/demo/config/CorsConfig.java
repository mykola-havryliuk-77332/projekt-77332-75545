package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Дозволяє всі шляхи API
                .allowedOrigins("*") // Дозволяє всім сайтам (фронтенду)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Дозволяє всі потрібні методи
                .allowedHeaders("*"); // Дозволяє будь-які заголовки
    }
}