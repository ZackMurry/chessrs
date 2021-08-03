package com.zackmurry.chessrs.dao.move

import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.model.MoveEntity
import java.util.*

interface MoveDao {

    fun create(request: MoveCreateRequest, userId: UUID, timeCreated: Long): UUID

    fun getMovesOrderedByLastReviewAsc(userId: UUID, limit: Int): List<MoveEntity>

    fun getById(id: UUID): MoveEntity?

    fun getRandom(userId: UUID, limit: Int): List<MoveEntity>

    fun getByFen(userId: UUID, fen: String): MoveEntity?

    fun getDue(userId: UUID, limit: Int): List<MoveEntity>

    fun getAmountDue(userId: UUID): Int

    fun resetReviewsById(id: UUID)

    fun addReview(id: UUID, due: Long)

    fun deleteById(id: UUID)

}