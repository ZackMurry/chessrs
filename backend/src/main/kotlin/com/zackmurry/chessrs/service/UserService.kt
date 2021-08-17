package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.dao.UserDao
import com.zackmurry.chessrs.entity.ChessrsUser
import com.zackmurry.chessrs.exception.NotFoundException
import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserService(private val userDao: UserDao) : UserDetailsService {

    companion object {
        fun getUserId(): UUID {
            return (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).getId()
        }
    }

    override fun loadUserByUsername(username: String?): UserDetails {
        if (username == null) {
            throw UsernameNotFoundException(null)
        }
        val user = userDao.findByUsername(username).orElseThrow { throw NotFoundException() }
        return UserPrincipal.create(user)
    }

    fun createUser(user: ChessrsUser) {
        userDao.save(user)
    }

    fun accountExists(username: String): Boolean {
        return userDao.existsByUsername(username)
    }

    fun getUserByUsername(username: String): ChessrsUser? {
        return userDao.findByUsername(username).orElse(null)
    }

    fun delete(username: String) {
        return userDao.deleteByUsername(username)
    }

    fun updateEaseFactor(easeFactor: Float) {
        userDao.updateEaseFactor(getUserId(), easeFactor)
    }

}
