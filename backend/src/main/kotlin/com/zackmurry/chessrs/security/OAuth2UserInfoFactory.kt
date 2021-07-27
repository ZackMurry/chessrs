package com.zackmurry.chessrs.security

import com.zackmurry.chessrs.exception.OAuth2AuthenticationProcessingException

object OAuth2UserInfoFactory {

    fun getOAuth2UserInfo(registrationId: String, attributes: Map<String, Any>): OAuth2UserInfo {
        if (registrationId.uppercase() == AuthProvider.LICHESS.toString()) {
            return LichessOAuth2UserInfo(attributes)
        } else {
            throw OAuth2AuthenticationProcessingException("Login with $registrationId is not supported")
        }
    }

}