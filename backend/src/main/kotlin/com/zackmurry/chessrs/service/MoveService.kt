package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.dao.move.MoveDao
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.exception.ForbiddenException
import com.zackmurry.chessrs.exception.NotFoundException
import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.model.MoveEntity
import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.util.*

@Service
class MoveService(private val moveDao: MoveDao) {

    private fun getUserId(): UUID {
        return (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).getId()
    }

    fun createMove(request: MoveCreateRequest) {
        if (request.fenBefore.length > 90 || request.fenAfter.length > 90 || request.san.length > 5 || request.uci.length > 4) {
            throw BadRequestException()
        }
        moveDao.createMove(request, getUserId())
    }

    fun getMovesThatNeedReview(limit: Int): List<MoveEntity> {
        return moveDao.getMovesOrderedByLastReviewAsc(getUserId(), limit)
    }

    fun getRandomMoves(limit: Int): List<MoveEntity> {
        return moveDao.getRandomMoves(getUserId(), limit)
    }

}