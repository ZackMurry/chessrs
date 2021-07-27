package com.zackmurry.chessrs.util

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@ConfigurationProperties(prefix = "app")
@Component
class ApplicationProperties {

    val auth = Auth()

    class Auth {
        var tokenSecret: String = "c2RhZHNkZ2dkZmZkc2RkZGdzZ2RzZnNkZnNkZmRmd29vZGFkamRrbXNhZGRzbWQ=" // Can (and should) be configured in application.yml
        var tokenExpirationMs: Long = 864000000
    }

}