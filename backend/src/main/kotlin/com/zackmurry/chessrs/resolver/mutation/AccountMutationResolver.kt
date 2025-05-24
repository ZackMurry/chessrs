package com.zackmurry.chessrs.resolver.mutation

import com.zackmurry.chessrs.model.UserPrincipalResponse
import com.zackmurry.chessrs.security.UserPrincipal
import com.zackmurry.chessrs.service.UserService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Controller
import org.springframework.stereotype.Service

@Controller
class AccountMutationResolver(val userService: UserService) {

    @MutationMapping
    fun updateSettings(@Argument easeFactor: Float?, @Argument scalingFactor: Float?): UserPrincipalResponse {
        val user = (SecurityContextHolder.getContext().authentication.principal as UserPrincipal)
        if (easeFactor != null) {
            userService.updateEaseFactor(easeFactor)
            user.setEaseFactor(easeFactor)
        }
        if (scalingFactor != null) {
            userService.updateScalingFactor(scalingFactor)
            user.setScalingFactor(scalingFactor)
        }
        SecurityContextHolder.getContext().authentication =
            UsernamePasswordAuthenticationToken(user, null, user.authorities)
        return user.toResponse()
    }

    @MutationMapping
    fun deleteAccount(): UserPrincipalResponse {
        userService.deleteByUsername((SecurityContextHolder.getContext().authentication.principal as UserPrincipal).username)
        val user = (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).toResponse()
        SecurityContextHolder.getContext().authentication = null
        return user
    }

}
