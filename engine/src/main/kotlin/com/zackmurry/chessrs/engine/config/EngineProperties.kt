package com.zackmurry.chessrs.engine.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "app.engine")
class EngineProperties {
    lateinit var stockfishPath: String
}