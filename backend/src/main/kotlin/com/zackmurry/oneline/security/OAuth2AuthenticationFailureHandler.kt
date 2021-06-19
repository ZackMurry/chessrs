package com.zackmurry.oneline.security

import com.zackmurry.oneline.util.CookieUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

private val oauthLogger: Logger = LoggerFactory.getLogger(OAuth2AuthenticationFailureHandler::class.java)

@Component
class OAuth2AuthenticationFailureHandler(private val httpCookieOAuth2RequestRepository: HttpCookieOAuth2RequestRepository) : SimpleUrlAuthenticationFailureHandler() {


    override fun onAuthenticationFailure(
        request: HttpServletRequest?,
        response: HttpServletResponse?,
        exception: AuthenticationException?
    ) {
        oauthLogger.debug("OAuth failure!")
        if (request == null || response == null) {
            return
        }
        var targetUrl = CookieUtils.getCookie(request, REDIRECT_URI_PARAM_COOKIE_NAME)?.value ?: "/"
        targetUrl = UriComponentsBuilder.fromUriString(targetUrl).queryParam("error", exception?.localizedMessage ?: "An error occurred while authenticating").build().toUriString()
        httpCookieOAuth2RequestRepository.removeAuthorizationRequestCookies(request, response)
        redirectStrategy.sendRedirect(request, response, targetUrl)
    }
}