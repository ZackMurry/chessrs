package com.zackmurry.chessrs.resolver.query

import com.zackmurry.chessrs.model.UserPrincipalResponse
import com.zackmurry.chessrs.security.UserPrincipal
import graphql.kickstart.tools.GraphQLQueryResolver
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class AccountQueryResolver : GraphQLQueryResolver {

    fun account(): UserPrincipalResponse {
        return (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).toResponse()
    }

}