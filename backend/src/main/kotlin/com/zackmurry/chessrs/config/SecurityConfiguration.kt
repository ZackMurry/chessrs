package com.zackmurry.chessrs.config

import com.zackmurry.chessrs.security.HttpCookieOAuth2RequestRepository
import com.zackmurry.chessrs.security.OAuth2AuthenticationSuccessHandler
import com.zackmurry.chessrs.service.OAuth2UserService
import org.springframework.context.annotation.Bean
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.security.config.web.servlet.invoke


@EnableWebSecurity
class SecurityConfiguration(
    private val oAuth2AuthenticationSuccessHandler: OAuth2AuthenticationSuccessHandler,
    private val oAuth2UserService: OAuth2UserService,
    private val httpCookieOAuth2RequestRepository: HttpCookieOAuth2RequestRepository
) : WebSecurityConfigurerAdapter() {

    override fun configure(http: HttpSecurity?) {
        http {
            csrf {
                disable()
            }
            authorizeRequests {
                authorize("/", permitAll)
                authorize(anyRequest, authenticated)
            }
            oauth2Login {
                redirectionEndpoint {
                    baseUri = "/api/v1/oauth2/callback/*"
                }
                authenticationSuccessHandler = oAuth2AuthenticationSuccessHandler
                userInfoEndpoint {
                    userService = oAuth2UserService
                }
                authorizationEndpoint {
                    authorizationRequestRepository = httpCookieOAuth2RequestRepository
                }
            }
        }
    }

    @Bean
    fun webClient(clientRegistrationRepository: ClientRegistrationRepository, authorizedClientRepository: OAuth2AuthorizedClientRepository): WebClient {
        val oauth2 = ServletOAuth2AuthorizedClientExchangeFilterFunction(clientRegistrationRepository, authorizedClientRepository)
        oauth2.setDefaultOAuth2AuthorizedClient(true)
        return WebClient.builder().apply(oauth2.oauth2Configuration()).build()
    }

}