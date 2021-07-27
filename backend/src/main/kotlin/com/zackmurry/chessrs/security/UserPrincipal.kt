package com.zackmurry.chessrs.security

import com.zackmurry.chessrs.model.UserEntity
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.core.user.OAuth2User
import java.util.*

class UserPrincipal(private var username: String, private var authorities: MutableCollection<out GrantedAuthority>, private var attributes: MutableMap<String, Any>) : OAuth2User, UserDetails {

    companion object {
        fun create(userEntity: UserEntity): UserPrincipal {
            val grantedAuthorities = Collections.singletonList(SimpleGrantedAuthority("ROLE_USER"))
            return UserPrincipal(userEntity.username, grantedAuthorities, HashMap())
        }

        fun create(userEntity: UserEntity, attributes: MutableMap<String, Any>): UserPrincipal {
            val userPrincipal = create(userEntity)
            userPrincipal.attributes = attributes
            return userPrincipal
        }
    }

    override fun getUsername(): String {
        return this.username
    }

    override fun getPassword(): String? {
        return null
    }

    override fun isAccountNonExpired(): Boolean {
        return true
    }

    override fun isAccountNonLocked(): Boolean {
        return true
    }

    override fun isCredentialsNonExpired(): Boolean {
        return true
    }

    override fun isEnabled(): Boolean {
        return true
    }

    override fun getAttributes(): MutableMap<String, Any> {
        return this.attributes
    }

    override fun getAuthorities(): MutableCollection<out GrantedAuthority> {
        return this.authorities
    }

    override fun getName(): String {
        return this.username
    }

}
