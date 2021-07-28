package com.zackmurry.chessrs.security

import com.zackmurry.chessrs.exception.InternalServerException
import com.zackmurry.chessrs.util.ApplicationProperties
import org.slf4j.LoggerFactory
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.util.*
import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import io.jsonwebtoken.security.SecurityException

private val logger = LoggerFactory.getLogger(TokenProvider::class.java)

@Service
class TokenProvider(private val applicationProperties: ApplicationProperties) {

    private val key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(applicationProperties.auth.tokenSecret))
    private val parser = Jwts.parserBuilder().setSigningKey(key).build()

    fun createToken(authentication: Authentication): String {
        val userPrincipal: UserPrincipal? = authentication.principal as? UserPrincipal
        if (userPrincipal == null) {
            logger.error("Error casting authentication.principal to UserPrincipal")
            throw InternalServerException()
        }
        val now = Date()
        val expiryDate = Date(now.time + applicationProperties.auth.tokenExpirationMs)
        return Jwts.builder()
            .setSubject(userPrincipal.username)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(key)
            .compact()
    }

    fun getUsernameFromToken(token: String): String {
        val claims = parser.parseClaimsJws(token).body
        return claims.subject
    }

    fun validateToken(token: String): Boolean {
        try {
            parser.parseClaimsJws(token)
            return true
        } catch (ex: SecurityException) {
            logger.debug("Invalid JWT signature")
        } catch (ex: MalformedJwtException) {
            logger.debug("Invalid JWT token")
        } catch (ex: ExpiredJwtException) {
            logger.debug("Expired JWT token")
        } catch (ex: UnsupportedJwtException) {
            logger.debug("Unsupported JWT token")
        } catch (ex: IllegalArgumentException) {
            logger.debug("JWT claims string is empty.")
        }
        return false
    }

}
