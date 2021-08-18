package com.zackmurry.chessrs.security

import com.zackmurry.chessrs.entity.ChessrsUser
import com.zackmurry.chessrs.exception.InternalServerException
import com.zackmurry.chessrs.model.UserPrincipalResponse
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.oauth2.core.user.OAuth2User
import java.util.*


class UserPrincipal(
    private var username: String,
    private var id: UUID,
    private var authorities: MutableCollection<out GrantedAuthority>,
    private var attributes: MutableMap<String, Any>,
    private var easeFactor: Float,
    private var scalingFactor: Float
) : OAuth2User, UserDetails {

    companion object {
        fun create(user: ChessrsUser): UserPrincipal {
            if (user.username == null || user.id == null || user.easeFactor == null || user.scalingFactor == null) {
                throw InternalServerException()
            }
            val grantedAuthorities = Collections.singletonList(SimpleGrantedAuthority("ROLE_USER"))
            return UserPrincipal(
                user.username!!,
                user.id!!,
                grantedAuthorities,
                HashMap(),
                user.easeFactor!!,
                user.scalingFactor!!
            )
        }

        fun create(user: ChessrsUser, attributes: MutableMap<String, Any>): UserPrincipal {
            val userPrincipal = create(user)
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

    fun getId(): UUID {
        return this.id
    }

    fun getEaseFactor(): Float {
        return this.easeFactor
    }

    fun setEaseFactor(easeFactor: Float) {
        this.easeFactor = easeFactor
    }

    fun getScalingFactor(): Float {
        return this.scalingFactor
    }

    fun setScalingFactor(scalingFactor: Float) {
        this.scalingFactor = scalingFactor
    }

    fun toResponse(): UserPrincipalResponse {
        return UserPrincipalResponse(
            username,
            id,
            authorities,
            attributes,
            easeFactor,
            scalingFactor,
            isEnabled,
            isAccountNonLocked,
            isAccountNonExpired,
            isCredentialsNonExpired,
            name
        )
    }

}
