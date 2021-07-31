package com.zackmurry.chessrs.dao.user

import com.zackmurry.chessrs.exception.InternalServerException
import com.zackmurry.chessrs.model.UserEntity
import org.flywaydb.core.internal.jdbc.JdbcTemplate
import org.springframework.stereotype.Repository
import java.sql.SQLException
import java.util.*
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
                return UserEntity(
                    resultSet.getString("username"),
                    UUID.fromString(resultSet.getString("id")),
                    resultSet.getString("provider"),
                    resultSet.getFloat("ease_factor"))
            }
            return null
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

    override fun createUser(user: UserEntity) {
        val sql = "INSERT INTO USERS (id, username, provider) VALUES (?, ?, ?)"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, user.id)
                setString(2, user.username)
                setString(3, user.provider)
                executeUpdate()
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

    override fun deleteUser(username: String) {
        val sql = "DELETE FROM users WHERE username = ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setString(1, username)
                executeUpdate()
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

}