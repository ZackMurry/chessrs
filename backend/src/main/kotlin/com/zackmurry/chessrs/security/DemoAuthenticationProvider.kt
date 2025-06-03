package com.zackmurry.chessrs.security

import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component

@Component
class DemoAuthenticationProvider : AuthenticationProvider {
    override fun authenticate(authentication: Authentication?): Authentication {
        return authentication ?: throw BadCredentialsException("No auth")
    }

    override fun supports(authentication: Class<*>): Boolean =
        DemoAuthenticationToken::class.java.isAssignableFrom(authentication)
}
