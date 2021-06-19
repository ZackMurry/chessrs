package com.zackmurry.oneline.dao.user

import com.zackmurry.oneline.model.UserEntity

interface UserDao {

    fun getUserByUsername(username: String): UserEntity?

    fun createUser(user: UserEntity)

}