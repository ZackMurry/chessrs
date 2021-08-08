package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.dao.UserDao
import com.zackmurry.chessrs.entity.ChessrsUser
import com.zackmurry.chessrs.exception.NotFoundException
import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserService(private val userDao: UserDao) : UserDetailsService {

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

}