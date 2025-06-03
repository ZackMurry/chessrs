package com.zackmurry.chessrs.controller

import com.zackmurry.chessrs.entity.ChessrsUser
import com.zackmurry.chessrs.security.AuthProvider
import com.zackmurry.chessrs.security.DemoAuthenticationToken
import com.zackmurry.chessrs.security.UserPrincipal
import com.zackmurry.chessrs.service.UserService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.context.HttpSessionSecurityContextRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/auth")
class DemoLoginController(
    private val authenticationManager: AuthenticationManager,
    private val userService: UserService
) {
    @PostMapping("/demo")
    fun loginAsDemo(
        request: HttpServletRequest,
        response: HttpServletResponse
    ): Map<String, String> {
        println("DEMO LOGIN")
        val userId = UUID.randomUUID()
        val username = "demo_" + userId.toString().substring(0, 8)
        val token = DemoAuthenticationToken(username)

        val authResult = authenticationManager.authenticate(token)
        val principal = UserPrincipal.create(username, userId, 1f, 1f, "ROLE_DEMO")
        val auth = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        SecurityContextHolder.getContext().authentication = auth

        userService.createUser(ChessrsUser(username, userId, AuthProvider.DEMO.toString(), 1f, 1f))

        val session = request.getSession(true)
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext())

        return mapOf("username" to username)
    }

    @GetMapping("/me")
    fun getCurrentUser(): UserPrincipal {
        val auth = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
        return auth
    }
}
