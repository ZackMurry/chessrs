package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.dao.move.MoveDao
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.exception.ForbiddenException
import com.zackmurry.chessrs.exception.NotFoundException
import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.model.MoveEntity
import com.zackmurry.chessrs.model.NeedReviewResponse
import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.*

@Service
class MoveService(private val moveDao: MoveDao, private val spacedRepetitionService: SpacedRepetitionService) {

    private fun getUserId(): UUID {
        return (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).getId()
    }

    fun createMove(request: MoveCreateRequest) {
        // todo: check if a position already has the same before_fen
        if (request.fenBefore.length > 90 || request.fenAfter.length > 90 || request.san.length > 5 || request.uci.length > 4) {
            throw BadRequestException()
        }
        moveDao.createMove(request, getUserId())
    }

    fun getMovesThatNeedReview(limit: Int): NeedReviewResponse {
        val moves = moveDao.getDueMoves(getUserId(), limit)
        val total = moveDao.getNumberOfDueMoves(getUserId())
        return NeedReviewResponse(total, moves)
    }

    fun getRandomMoves(limit: Int): List<MoveEntity> {
        return moveDao.getRandomMoves(getUserId(), limit)
    }

    fun getMoveByFen(fen: String): MoveEntity {
        println("fen: $fen")
        val move = moveDao.getMoveByFen(getUserId(), fen) ?: throw ResponseStatusException(HttpStatus.NO_CONTENT)
        println("move: ${move.san}")
        return move
    }

    fun studyMove(id: UUID, success: Boolean) {
        val move = moveDao.getMoveById(id) ?: throw NotFoundException()
        if (getUserId() != move.userId) {
            throw ForbiddenException()
        }
        if (success) {
            val interval = spacedRepetitionService.calculateNextDueInterval(move.numReviews)
            val due = System.currentTimeMillis() + interval
            moveDao.addReview(id, due)
        } else {
            moveDao.resetMoveReviews(id)
        }
    }

}