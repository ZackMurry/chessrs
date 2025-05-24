package com.zackmurry.chessrs.security

import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.util.CookieUtils
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

private val logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler::class.java)

const val JWT_COOKIE_NAME = "jwt"

@Component
class OAuth2AuthenticationSuccessHandler(private val httpCookieOAuth2RequestRepository: HttpCookieOAuth2RequestRepository) :
    SimpleUrlAuthenticationSuccessHandler() {

    override fun onAuthenticationSuccess(
        request: HttpServletRequest?,
        response: HttpServletResponse?,
        authentication: Authentication?
    ) {
        logger.debug("OAuth success")
        if (request == null || response == null) {
            return
        }
        val targetUrl = determineTargetUrl(request, response, authentication)
        if (response.isCommitted) {
            logger.debug("Response has already been committed. Unable to redirect to $targetUrl")
            return
        }

        clearAuthenticationAttributes(request, response)
        redirectStrategy.sendRedirect(request, response, targetUrl)
    }

    override fun determineTargetUrl(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication?
    ): String {
        val targetUrl = CookieUtils.getCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME)?.value ?: "/home"
        println("targetUrl: $targetUrl")
        if (authentication == null) {
            throw BadRequestException()
        }
        return targetUrl
    }

    protected fun clearAuthenticationAttributes(request: HttpServletRequest, response: HttpServletResponse) {
        super.clearAuthenticationAttributes(request)
        httpCookieOAuth2RequestRepository.removeAuthorizationRequestCookies(request, response)
    }

}