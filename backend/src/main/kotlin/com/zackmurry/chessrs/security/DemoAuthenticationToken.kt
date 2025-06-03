package com.zackmurry.chessrs.security

import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority

class DemoAuthenticationToken(private val username: String) :
    AbstractAuthenticationToken(listOf(SimpleGrantedAuthority("ROLE_DEMO"))) {

    init {
        isAuthenticated = true
    }

    override fun getCredentials(): Any? = null
    override fun getPrincipal(): Any = username
}
