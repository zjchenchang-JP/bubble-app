package com.zjcc.bubble;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.zjcc.bubble.mapper")
public class BubbleApplication {

    public static void main(String[] args) {
        SpringApplication.run(BubbleApplication.class, args);
    }

}
