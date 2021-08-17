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

    fun updateSettings(easeFactor: Float?): UserPrincipalResponse {
        val user = (SecurityContextHolder.getContext().authentication.principal as UserPrincipal)
        if (easeFactor != null) {
            userService.updateEaseFactor(easeFactor)
            user.setEaseFactor(easeFactor)
        }
        SecurityContextHolder.getContext().authentication = UsernamePasswordAuthenticationToken(user, null, user.authorities)
        return user.toResponse()
    }

}