package com.zackmurry.chessrs.dao.move

import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.model.MoveEntity
import java.util.*

interface MoveDao {

    fun createMove(request: MoveCreateRequest, userId: UUID)

    fun getMovesOrderedByLastReviewAsc(userId: UUID, limit: Int): List<MoveEntity>

    fun getMoveById(id: UUID): MoveEntity?

    fun getRandomMoves(userId: UUID, limit: Int): List<MoveEntity>

    fun getMoveByFen(userId: UUID, fen: String): MoveEntity?

    fun getDueMoves(userId: UUID, limit: Int): List<MoveEntity>

    fun getNumberOfDueMoves(userId: UUID): Int

    fun resetMoveReviews(id: UUID)

    fun addReview(id: UUID, due: Long)

}