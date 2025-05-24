package com.zackmurry.chessrs.resolver.query

import com.zackmurry.chessrs.model.UserPrincipalResponse
import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Controller
import org.springframework.stereotype.Service

@Controller
class AccountQueryResolver {

    @QueryMapping
    fun account(): UserPrincipalResponse {
        println(SecurityContextHolder.getContext().authentication.principal)
        return (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).toResponse()
    }

}