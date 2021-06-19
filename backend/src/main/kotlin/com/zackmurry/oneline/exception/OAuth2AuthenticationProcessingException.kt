package com.zackmurry.oneline.exception

import org.springframework.security.core.AuthenticationException

class OAuth2AuthenticationProcessingException(msg: String) : AuthenticationException(msg)
