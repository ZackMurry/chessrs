package com.zackmurry.chessrs.dao

import com.zackmurry.chessrs.entity.Move
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Transactional
interface MoveDao : JpaRepository<Move, UUID> {

    @Query("SELECT * FROM move WHERE user_id = :userId ORDER BY random() LIMIT :limit", nativeQuery = true)
    fun getRandom(@Param("userId") userId: UUID, @Param("limit") limit: Int = 5): List<Move>

    @Query("SELECT * FROM move WHERE user_id = :userId AND fen_before = :fenBefore", nativeQuery = true)
    fun findByFenBefore(@Param("userId") userId: UUID, @Param("fenBefore") fen: String): Optional<Move>

    @Query("SELECT * FROM move WHERE user_id = :userId AND due <= :time ORDER BY due LIMIT :limit", nativeQuery = true)
    fun getDue(@Param("userId") userId: UUID, @Param("limit") limit: Int = 5, @Param("time") time: Long = System.currentTimeMillis()): List<Move>

    @Query("SELECT COUNT(*) FROM move WHERE user_id = :userId AND due <= :time", nativeQuery = true)
    fun getAmountDue(@Param("userId") userId: UUID, @Param("time") time: Long = System.currentTimeMillis()): Int

    @Modifying
    @Query("UPDATE move SET num_reviews = 0, last_reviewed = :time, due = :time WHERE id = :id", nativeQuery = true)
    fun resetReviewsById(@Param("id") id: UUID, @Param("time") time: Long = System.currentTimeMillis())

    @Modifying
    @Query("UPDATE move SET num_reviews = num_reviews + 1, due = :due WHERE id = :id", nativeQuery = true)
    fun addReview(@Param("id") id: UUID, @Param("due") due: Long)

    @Query("SELECT * FROM move WHERE user_id = :userId ORDER BY time_created DESC OFFSET :page * :limit LIMIT :limit", nativeQuery = true)
    fun findByUserId(@Param("userId") userId: UUID, @Param("page") page: Int, @Param("limit") limit: Int): List<Move>

    @Query("SELECT COUNT(*) FROM move WHERE user_id = :userId", nativeQuery = true)
    fun getNumberOfMoves(@Param("userId") userId: UUID): Int

}
