package com.zackmurry.chessrs.dao.user

import com.zackmurry.chessrs.model.UserEntity

interface UserDao {

    fun getUserByUsername(username: String): UserEntity?

    fun createUser(user: UserEntity)

    fun deleteUser(username: String)

}