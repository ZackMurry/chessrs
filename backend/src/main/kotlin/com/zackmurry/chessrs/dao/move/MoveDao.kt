package com.zackmurry.chessrs.dao.move

import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.model.MoveEntity
import java.util.*

interface MoveDao {

    fun createMove(request: MoveCreateRequest, userId: UUID)

    fun getMovesOrderedByLastReviewAsc(userId: UUID, limit: Int): List<MoveEntity>

}