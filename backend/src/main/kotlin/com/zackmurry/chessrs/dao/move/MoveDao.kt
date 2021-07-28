package com.zackmurry.chessrs.dao.move

import com.zackmurry.chessrs.model.MoveCreateRequest
import java.util.*

interface MoveDao {

    fun createMove(request: MoveCreateRequest, userId: UUID)

}