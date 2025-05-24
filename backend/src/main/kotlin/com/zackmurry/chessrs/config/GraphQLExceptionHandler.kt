package com.zackmurry.chessrs.config

import com.zackmurry.chessrs.exception.*
import graphql.GraphQLError
import graphql.GraphqlErrorBuilder
import graphql.schema.DataFetchingEnvironment
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter
import org.springframework.graphql.execution.ErrorType
import org.springframework.stereotype.Component
import kotlin.reflect.typeOf


val logger: Logger = LoggerFactory.getLogger(GraphQLExceptionHandler::class.java)

@Component
class GraphQLExceptionHandler : DataFetcherExceptionResolverAdapter() {
    override fun resolveToSingleError(ex: Throwable, env: DataFetchingEnvironment): GraphQLError? {
        val errorType = when (ex) {
            is NotFoundException -> ErrorType.NOT_FOUND
            is ForbiddenException -> ErrorType.FORBIDDEN
            is InternalServerException -> ErrorType.INTERNAL_ERROR
            else -> ErrorType.BAD_REQUEST
        }
        return GraphqlErrorBuilder.newError()
            .errorType(errorType)
            .message(ex.message)
            .path(env.executionStepInfo.path)
            .location(env.field.sourceLocation)
            .build()
    }
}
