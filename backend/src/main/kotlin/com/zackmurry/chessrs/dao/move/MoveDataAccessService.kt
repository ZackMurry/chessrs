package com.zackmurry.chessrs.dao.move

import com.zackmurry.chessrs.exception.InternalServerException
import com.zackmurry.chessrs.model.MoveCreateRequest
import org.flywaydb.core.internal.jdbc.JdbcTemplate
import org.springframework.stereotype.Repository
import java.sql.SQLException
import java.util.*
import javax.sql.DataSource

@Repository
class MoveDataAccessService(dataSource: DataSource) : MoveDao {

    val jdbcTemplate = JdbcTemplate(dataSource.connection)

    override fun createMove(request: MoveCreateRequest, userId: UUID) {
        val sql = "INSERT INTO moves (user_id, fen_before, san, uci, fen_after, last_reviewed, time_created, is_white) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        val currentTime = System.currentTimeMillis()
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, userId)
                setString(2, request.fenBefore)
                setString(3, request.san)
                setString(4, request.uci)
                setString(5, request.fenAfter)
                setLong(6, currentTime)
                setLong(7, currentTime)
                setBoolean(8, request.isWhite)
                executeUpdate()
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

}