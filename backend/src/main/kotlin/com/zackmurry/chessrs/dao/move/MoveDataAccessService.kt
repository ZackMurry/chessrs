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

    override fun create(request: MoveCreateRequest, userId: UUID, timeCreated: Long): UUID {
        val sql = "INSERT INTO moves (user_id, fen_before, san, uci, fen_after, last_reviewed, time_created, is_white, due) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        try {
            jdbcTemplate.connection.prepareStatement(sql, arrayOf("id")).run {
                setObject(1, userId)
                setString(2, request.fenBefore)
                setString(3, request.san)
                setString(4, request.uci)
                setString(5, request.fenAfter)
                setLong(6, timeCreated)
                setLong(7, timeCreated)
                setBoolean(8, request.isWhite)
                setLong(9, timeCreated)
                executeUpdate()
                generatedKeys.run {
                    if (next()) {
                        return UUID.fromString(getString("id"))
                    } else {
                        throw InternalServerException()
                    }
                }
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
                getInt("num_reviews"),
                getLong("due")
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

    override fun getRandom(userId: UUID, limit: Int): List<MoveEntity> {
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

    override fun getById(id: UUID): MoveEntity? {
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

    override fun getByFen(userId: UUID, fen: String): MoveEntity? {
        val sql = "SELECT * FROM moves WHERE user_id = ? AND fen_before = ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, userId)
                setString(2, fen)
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

    override fun getDue(userId: UUID, limit: Int): List<MoveEntity> {
        val sql = "SELECT * FROM moves WHERE user_id = ? AND due <= ? ORDER BY due LIMIT ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, userId)
                setLong(2, System.currentTimeMillis())
                setInt(3, limit)
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

    override fun getAmountDue(userId: UUID): Int {
        val sql = "SELECT COUNT(*) FROM moves WHERE user_id = ? AND due <= ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, userId)
                setLong(2, System.currentTimeMillis())
                executeQuery().run {
                    if (next()) {
                        return getInt("count")
                    }
                    throw InternalServerException()
                }
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

    override fun resetReviewsById(id: UUID) {
        val sql = "UPDATE moves SET num_reviews = 0, last_reviewed = ?, due = ? WHERE id = ?"
        val time = System.currentTimeMillis()
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setLong(1, time)
                setLong(2, time)
                setObject(3, id)
                executeUpdate()
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

    override fun addReview(id: UUID, due: Long) {
        val sql = "UPDATE moves SET num_reviews = num_reviews + 1, due = ? WHERE id = ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setLong(1, due)
                setObject(2, id)
                executeUpdate()
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

    override fun deleteById(id: UUID) {
        val sql = "DELETE FROM moves WHERE id = ?"
        try {
            jdbcTemplate.connection.prepareStatement(sql).run {
                setObject(1, id)
                executeUpdate()
            }
        } catch (e: SQLException) {
            e.printStackTrace()
            throw InternalServerException()
        }
    }

}
