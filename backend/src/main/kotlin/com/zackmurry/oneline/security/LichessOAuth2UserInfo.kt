package com.zackmurry.oneline.security

class LichessOAuth2UserInfo(attributes: Map<String, Any>) : OAuth2UserInfo(attributes) {

    override fun getUsername(): String? {
        return attributes["username"] as String?
    }

}