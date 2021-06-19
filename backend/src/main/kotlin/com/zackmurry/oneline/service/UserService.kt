package com.zackmurry.oneline.service

import com.zackmurry.oneline.dao.user.UserDao
import com.zackmurry.oneline.security.UserPrincipal
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

}