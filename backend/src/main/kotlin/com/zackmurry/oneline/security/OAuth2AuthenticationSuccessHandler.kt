package com.zackmurry.oneline.security

import com.zackmurry.oneline.exception.BadRequestException
import com.zackmurry.oneline.util.CookieUtils
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

private val logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler::class.java)

@Component
class OAuth2AuthenticationSuccessHandler(private val tokenProvider: TokenProvider, private val httpCookieOAuth2RequestRepository: HttpCookieOAuth2RequestRepository) : SimpleUrlAuthenticationSuccessHandler() {

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

    override fun determineTargetUrl(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication?): String {
        val targetUrl = CookieUtils.getCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME)?.value ?: defaultTargetUrl
        if (authentication == null) {
            throw BadRequestException()
        }
        val token = tokenProvider.createToken(authentication)
        // todo: handle token on frontend. might not need tokens at all, though
        return UriComponentsBuilder.fromUriString(targetUrl).queryParam("token", token).build().toString()
    }

    protected fun clearAuthenticationAttributes(request: HttpServletRequest, response: HttpServletResponse) {
        super.clearAuthenticationAttributes(request)
        httpCookieOAuth2RequestRepository.removeAuthorizationRequestCookies(request, response)
    }

}