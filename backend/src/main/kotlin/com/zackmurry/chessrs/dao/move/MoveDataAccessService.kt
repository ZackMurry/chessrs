package com.zackmurry.chessrs.dao.move

import com.zackmurry.chessrs.exception.InternalServerException
import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.model.MoveEntity
import org.flywaydb.core.internal.jdbc.JdbcTemplate
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.sql.ResultSet
import java.sql.SQLException
import java.util.*
import javax.sql.DataSource
import kotlin.collections.ArrayList

@Repository
@Transactional
class MoveDataAccessService(dataSource: DataSource) : MoveDao {

    val jdbcTemplate = JdbcTemplate(dataSource.connection)

    override fun createMove(request: MoveCreateRequest, userId: UUID) {
        val sql = "INSERT INTO moves (user_id, fen_before, san, uci, fen_after, last_reviewed, time_created, is_white) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
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

    private fun extractMoveEntity(rs: ResultSet): MoveEntity {
        rs.run {
            return MoveEntity(
                getString("fen_before"),
                getString("san"),
                getString("uci"),
                getString("fen_after"),
                getBoolean("is_white"),
                UUID.fromString(getString("id")),
                UUID.fromString(getString("user_id")),
                getLong("last_reviewed"),
                getLong("time_created"),
                getInt("num_reviews")
            )
        }
    }

    override fun getMovesOrderedByLastReviewAsc(userId: UUID, limit: Int): List<MoveEntity> {
        val sql = "SELECT * FROM moves WHERE user_id = ? ORDER BY last_reviewed LIMIT ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, userId)
                setInt(2, limit)
                executeQuery().run {
                    val list = ArrayList<MoveEntity>()
                    while (resultSet.next()) {
                        list.add(extractMoveEntity(this))
                    }
                    return list
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

    override fun getRandomMoves(userId: UUID, limit: Int): List<MoveEntity> {
        val sql = "SELECT * FROM moves WHERE user_id = ? ORDER BY random() LIMIT ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, userId)
                setInt(2, limit)
                executeQuery().run {
                    val list = ArrayList<MoveEntity>()
                    while (resultSet.next()) {
                        list.add(extractMoveEntity(this))
                    }
                    return list
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }

    }

    override fun getMoveById(id: UUID): MoveEntity? {
        val sql = "SELECT * FROM moves WHERE id = ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, id)
                executeQuery().run {
                    return if (next()) {
                        extractMoveEntity(this)
                    } else {
                        null
                    }
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

}