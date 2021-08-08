package com.zackmurry.chessrs.dao

import com.zackmurry.chessrs.entity.ChessrsUser
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional
import java.util.*

@Transactional
interface UserDao : JpaRepository<ChessrsUser, UUID> {

    fun findByUsername(username: String): Optional<ChessrsUser>

    fun existsByUsername(username: String): Boolean

    fun deleteByUsername(username: String)

}
