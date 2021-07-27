package com.zackmurry.chessrs.config

import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.exception.ForbiddenException
import com.zackmurry.chessrs.exception.InternalServerException
import org.springframework.http.HttpStatus
import org.springframework.security.core.AuthenticationException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class WebRestControllerAdvice {

    @ExceptionHandler(InternalServerException::class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    fun handleInternalServerException(exception: InternalServerException): String? {
        exception.printStackTrace()
        return exception.message
    }

    @ExceptionHandler(AuthenticationException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleAuthenticationException(exception: AuthenticationException): String? = exception.message

    @ExceptionHandler(ForbiddenException::class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    fun handleForbiddenException(exception: ForbiddenException): String? = exception.message

    @ExceptionHandler(BadRequestException::class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    fun handleBadRequestException(exception: BadRequestException): String? = exception.message

}