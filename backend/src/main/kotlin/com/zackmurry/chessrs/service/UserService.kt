package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.dao.user.UserDao
import com.zackmurry.chessrs.model.UserEntity
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
        val user = userDao.getUserByUsername(username) ?: throw UsernameNotFoundException(username)
        return UserPrincipal.create(user)
    }

    fun createUser(user: UserEntity) {
        userDao.createUser(user)
    }

    fun accountExists(username: String): Boolean {
        return userDao.getUserByUsername(username) != null
    }

    fun getUserByUsername(username: String): UserEntity? {
        return userDao.getUserByUsername(username)
    }

    fun delete(username: String) {
        return userDao.deleteUser(username)
    }

}