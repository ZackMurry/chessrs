package com.zackmurry.oneline.security

abstract class OAuth2UserInfo(val attributes: Map<String, Any>) {

    abstract fun getUsername(): String?

}