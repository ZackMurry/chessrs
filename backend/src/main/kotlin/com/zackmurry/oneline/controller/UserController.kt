package com.zackmurry.oneline.controller

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/users")
@RestController
class UserController {

    @GetMapping("/me")
    fun getAccountInfo(): Any {
        return SecurityContextHolder.getContext().authentication.principal
    }

}