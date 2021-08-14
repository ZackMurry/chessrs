package com.zackmurry.chessrs.config

import com.zackmurry.chessrs.exception.InternalServerException
import graphql.kickstart.spring.error.ThrowableGraphQLError
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.ExceptionHandler

val logger: Logger = LoggerFactory.getLogger(GraphQLExceptionHandler::class.java)

@Component
class GraphQLExceptionHandler {

    // Print internal server exceptions
    @ExceptionHandler(InternalServerException::class)
    fun handleInternalServerException(exception: InternalServerException): ThrowableGraphQLError {
        logger.error(exception.message, exception)
        return ThrowableGraphQLError(exception)
    }

    // Send back errors for other exceptions
    @ExceptionHandler(Throwable::class)
    fun handleException(exception: Throwable): ThrowableGraphQLError {
        return ThrowableGraphQLError(exception)
    }

}
