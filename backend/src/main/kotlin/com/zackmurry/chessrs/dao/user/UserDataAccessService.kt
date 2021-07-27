package com.zackmurry.chessrs.dao.user

import com.zackmurry.chessrs.exception.InternalServerException
import com.zackmurry.chessrs.model.UserEntity
import org.flywaydb.core.internal.jdbc.JdbcTemplate
import org.springframework.stereotype.Repository
import java.sql.SQLException
import javax.sql.DataSource

@Repository
class UserDataAccessService(private val dataSource: DataSource) : UserDao {

    val jdbcTemplate = JdbcTemplate(dataSource.connection)

    override fun getUserByUsername(username: String): UserEntity? {
        val sql = "SELECT * FROM users WHERE username = ?"
        try {
            val preparedStatement = jdbcTemplate.connection.prepareStatement(sql)
            preparedStatement.setString(1, username)
            val resultSet = preparedStatement.executeQuery()
            if (resultSet.next()) {
                return UserEntity(resultSet.getString("username"), resultSet.getString("provider"))
            }
            return null
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

    override fun createUser(user: UserEntity) {
        val sql = "INSERT INTO USERS (username, provider) VALUES (?, ?)"
        try {
            val preparedStatement = jdbcTemplate.connection.prepareStatement(sql)
            preparedStatement.setString(1, user.username)
            preparedStatement.setString(2, user.provider)
            preparedStatement.executeUpdate()
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }


}