package com.zackmurry.oneline.service

import com.zackmurry.oneline.dao.user.UserDao
import com.zackmurry.oneline.exception.OAuth2AuthenticationProcessingException
import com.zackmurry.oneline.model.UserEntity
import com.zackmurry.oneline.security.*
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.InternalAuthenticationServiceException
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service

private val logger = LoggerFactory.getLogger(OAuth2UserService::class.java)

@Service
class OAuth2UserService(private val userDao: UserDao) : DefaultOAuth2UserService() {

    override fun loadUser(userRequest: OAuth2UserRequest?): OAuth2User {
        val oAuth2User = super.loadUser(userRequest)
        logger.debug("Loading user...")
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
//        oAuth2User.attributes.keys.forEach { key -> println("$key: ${oAuth2User.attributes[key]}") }
        val oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(userRequest.clientRegistration.registrationId, oAuth2User.attributes)
        val username = oAuth2UserInfo.getUsername()
        if (username == null || username.isBlank()) {
            throw OAuth2AuthenticationProcessingException("Username not found from OAuth2 provider")
        }

        val queriedUser = userDao.getUserByUsername(username)
        val user: UserEntity
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

    private fun registerNewUser(oAuth2UserRequest: OAuth2UserRequest, oAuth2UserInfo: OAuth2UserInfo): UserEntity {
        val username = oAuth2UserInfo.getUsername() ?: throw OAuth2AuthenticationProcessingException("Username not found from OAuth2 provider")
        val user = UserEntity(username, oAuth2UserRequest.clientRegistration.registrationId.uppercase())
        userDao.createUser(user)
        return user
    }

}