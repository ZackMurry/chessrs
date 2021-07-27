package com.zackmurry.chessrs.security

abstract class OAuth2UserInfo(val attributes: Map<String, Any>) {

    abstract fun getUsername(): String?

}