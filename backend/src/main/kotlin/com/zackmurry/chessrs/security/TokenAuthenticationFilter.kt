package com.zackmurry.chessrs.security

import com.zackmurry.chessrs.exception.ForbiddenException
import com.zackmurry.chessrs.service.UserService
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class TokenAuthenticationFilter(private val tokenProvider: TokenProvider, private val userService: UserService) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
//        println("filter")
//        try {
//            val bearerToken = request.getHeader("Authorization")
//            if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
//                val jwt = bearerToken.substring(7)
//                val username = tokenProvider.getUsernameFromToken(jwt)
//                val userDetails = userService.loadUserByUsername(username)
//                val authentication = UsernamePasswordAuthenticationToken(userDetails, null, userDetails.authorities)
//                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
//                SecurityContextHolder.getContext().authentication = authentication
//                println("success")
//            }
//        } catch (e: Exception) {
//            e.printStackTrace()
//        }
        filterChain.doFilter(request, response)
    }
}