package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.dao.MoveDao
import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.entity.Move
import com.zackmurry.chessrs.exception.*
import com.zackmurry.chessrs.model.MoveResponse
import com.zackmurry.chessrs.model.NeedReviewResponse
import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.util.*

@Service
class MoveService(private val moveDao: MoveDao, private val spacedRepetitionService: SpacedRepetitionService) {

    private fun getUserId(): UUID {
        return (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).getId()
    }

    fun createMove(fenBefore: String, san: String, uci: String, fenAfter: String, isWhite: Boolean): Move {
        // todo: check if a position already has the same before_fen
        if (fenBefore.length > 90 || fenAfter.length > 90 || san.length > 5 || uci.length > 4) {
            throw BadRequestException()
        }
        val currTime = System.currentTimeMillis()
        val move = Move(fenBefore, san, uci, fenAfter, isWhite, UUID.randomUUID(), getUserId(), currTime, currTime, 0, currTime)
        moveDao.save(move)
        return move
    }

    fun getDueMoves(limit: Int) = moveDao.getDue(getUserId(), limit)

    fun getRandomMoves(limit: Int): List<Move> {
        return moveDao.getRandom(getUserId(), limit)
    }

    fun getMoveByFen(fen: String): Move {
        return moveDao.findByFenBefore(getUserId(), fen).orElseThrow { throw NoContentException() }
    }

    fun studyMove(id: UUID, success: Boolean) {
        val move = moveDao.findById(id).orElseThrow { throw NotFoundException() }
        if (getUserId() != move.userId) {
            throw ForbiddenException()
        }
        if (move.numReviews == null) {
            throw InternalServerException()
        }
        if (success) {
            val interval = spacedRepetitionService.calculateNextDueInterval(move.numReviews!!)
            val due = System.currentTimeMillis() + interval
            moveDao.addReview(id, due)
        } else {
            moveDao.resetReviewsById(id)
        }
    }

    fun getMoveById(id: UUID): Move {
        val move = moveDao.findById(id).orElseThrow { throw NotFoundException() }
        if (getUserId() != move.userId) {
            throw ForbiddenException()
        }
        return move
    }

    fun deleteById(id: UUID) {
        val move = moveDao.findById(id).orElseThrow { throw NotFoundException() }
        if (getUserId() != move.userId) {
            throw ForbiddenException()
        }
        moveDao.deleteById(id)
    }

    fun getNumberOfDueMoves() = moveDao.getAmountDue(getUserId())

}