package com.zackmurry.chessrs.controller

import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/users")
@RestController
class UserController {

    @GetMapping("/account")
    fun getAccountData(): Any {
        return SecurityContextHolder.getContext().authentication.principal as UserPrincipal
    }

}