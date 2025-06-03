package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.entity.ChessrsUser
import com.zackmurry.chessrs.exception.OAuth2AuthenticationProcessingException
import com.zackmurry.chessrs.security.OAuth2UserInfo
import com.zackmurry.chessrs.security.OAuth2UserInfoFactory
import com.zackmurry.chessrs.security.UserPrincipal
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.InternalAuthenticationServiceException
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service
import java.util.*

private val logger = LoggerFactory.getLogger(OAuth2UserService::class.java)

@Service
class OAuth2UserService(private val userService: UserService) : DefaultOAuth2UserService() {

    override fun loadUser(userRequest: OAuth2UserRequest?): OAuth2User {
        val oAuth2User = super.loadUser(userRequest)
        logger.debug("Loading user...")
        println("LOADING OAUTH USER")
        try {
            return processOAuth2User(userRequest, oAuth2User)
        } catch (e: Exception) {
            throw InternalAuthenticationServiceException(e.message, e)
        }
    }

    private fun processOAuth2User(userRequest: OAuth2UserRequest?, oAuth2User: OAuth2User): OAuth2User {
        if (userRequest == null) {
            throw OAuth2AuthenticationProcessingException("User request is not found")
        }
//        oAuth2User.attributes.keys.forEach { println("$it: ${oAuth2User.attributes[it]}") }
        val oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
            userRequest.clientRegistration.registrationId,
            oAuth2User.attributes
        )
        val username = oAuth2UserInfo.getUsername()
        if (username == null || username.isBlank()) {
            throw OAuth2AuthenticationProcessingException("Username not found from OAuth2 provider")
        }

        val queriedUser = userService.getUserByUsername(username)
        val user: ChessrsUser
        if (queriedUser != null) {
            user = queriedUser
            if (user.provider != userRequest.clientRegistration.registrationId.uppercase()) {
                throw OAuth2AuthenticationProcessingException("You've signed up with ${user.provider}. Please use your ${user.provider} account to sign in.")
            }
        } else {
            user = registerNewUser(userRequest, oAuth2UserInfo)
        }

        return UserPrincipal.create(user, oAuth2User.attributes)
    }

    private fun registerNewUser(oAuth2UserRequest: OAuth2UserRequest, oAuth2UserInfo: OAuth2UserInfo): ChessrsUser {
        val username = oAuth2UserInfo.getUsername()
            ?: throw OAuth2AuthenticationProcessingException("Username not found from OAuth2 provider")
        val user = ChessrsUser(
            username,
            UUID.randomUUID(),
            oAuth2UserRequest.clientRegistration.registrationId.uppercase(),
            DEFAULT_EASE,
            DEFAULT_SCALING
        )
        userService.createUser(user)
        return user
    }

}