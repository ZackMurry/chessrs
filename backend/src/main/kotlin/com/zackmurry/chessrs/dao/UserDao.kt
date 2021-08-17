package com.zackmurry.chessrs.dao

import com.zackmurry.chessrs.entity.ChessrsUser
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Transactional
interface UserDao : JpaRepository<ChessrsUser, UUID> {

    fun findByUsername(username: String): Optional<ChessrsUser>

    fun existsByUsername(username: String): Boolean

    fun deleteByUsername(username: String)

    @Modifying
    @Query("UPDATE chessrs_user SET ease_factor = :easeFactor WHERE id = :id", nativeQuery = true)
    fun updateEaseFactor(@Param("id") id: UUID, @Param("easeFactor") easeFactor: Float)

}
