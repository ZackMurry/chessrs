package com.zackmurry.chessrs.resolver.mutation

import com.zackmurry.chessrs.model.UserPrincipalResponse
import com.zackmurry.chessrs.security.UserPrincipal
import com.zackmurry.chessrs.service.UserService
import graphql.kickstart.tools.GraphQLMutationResolver
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class AccountMutationResolver(val userService: UserService) : GraphQLMutationResolver {

    fun updateSettings(easeFactor: Float?, scalingFactor: Float?): UserPrincipalResponse {
        val user = (SecurityContextHolder.getContext().authentication.principal as UserPrincipal)
        if (easeFactor != null) {
            userService.updateEaseFactor(easeFactor)
            user.setEaseFactor(easeFactor)
        }
        if (scalingFactor != null) {
            userService.updateScalingFactor(scalingFactor)
            user.setScalingFactor(scalingFactor)
        }
        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(user, null, user.authorities)
        return user.toResponse()
    }

    fun deleteAccount(): UserPrincipalResponse {
        userService.deleteByUsername((SecurityContextHolder.getContext().authentication.principal as UserPrincipal).username)
        val user = (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).toResponse()
        SecurityContextHolder.getContext().authentication = null
        return user
    }

}