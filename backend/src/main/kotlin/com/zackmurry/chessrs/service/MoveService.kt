package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.dao.MoveDao
import com.zackmurry.chessrs.entity.Move
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.exception.ForbiddenException
import com.zackmurry.chessrs.exception.InternalServerException
import com.zackmurry.chessrs.exception.NotFoundException
import com.zackmurry.chessrs.service.UserService.Companion.getUserId
import com.zackmurry.chessrs.util.FenCleaner
import org.springframework.stereotype.Service
import java.util.*

@Service
class MoveService(
    private val moveDao: MoveDao,
    private val spacedRepetitionService: SpacedRepetitionService,
    private val fenCleaner: FenCleaner
) {

    fun createMove(fenBefore: String, san: String, uci: String, isWhite: Boolean, opening: String): Move {
        // todo: check if a position already has the same before_fen

        // todo: strip en passant number and 50 move rule number from pgn to help with transpositions
        // For example, 1. d4 e6 2. c4 d5 is treated as a different position than 1. d4 d5 2. c4 e6

        if (fenBefore.length > 90 || san.length > 7 || uci.length > 4 || opening.length > 256) {
            throw BadRequestException()
        }
        val currTime = System.currentTimeMillis()
        val move =
            Move(
                fenBefore,
                san,
                uci,
                isWhite,
                UUID.randomUUID(),
                getUserId(),
                currTime,
                currTime,
                0,
                currTime,
                opening,
                fenCleaner.cleanFen(fenBefore)
            )
        moveDao.save(move)
        return move
    }

    fun getDueMoves(limit: Int) = moveDao.getDue(getUserId(), limit)

    fun getRandomMoves(limit: Int): List<Move> {
        return moveDao.getRandom(getUserId(), limit)
    }

    fun getMoveByFen(fen: String): Optional<Move> {
        return moveDao.findByFenBefore(getUserId(), fen)
    }

    fun getMoveByCleanFen(fenBefore: String): Optional<Move> {
        // todo: this doesn't handle transpositions with en passant very well
        return moveDao.findByCleanFen(getUserId(), fenCleaner.cleanFen(fenBefore))
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

    fun getMoveById(id: UUID): Optional<Move> {
        val move = moveDao.findById(id).orElse(null) ?: return Optional.empty()
        if (getUserId() != move.userId) {
            throw ForbiddenException()
        }
        return Optional.of(move)
    }

    fun deleteById(id: UUID) {
        val move = moveDao.findById(id).orElseThrow { throw NotFoundException() }
        if (getUserId() != move.userId) {
            throw ForbiddenException()
        }
        moveDao.deleteById(id)
    }

    fun getNumberOfDueMoves() = moveDao.getAmountDue(getUserId())

    fun getMoves(page: Int, limit: Int): List<Move> {
        if (limit == -1) {
            return moveDao.findByUserId(getUserId())
        }
        if (page < 0 || limit < 0) {
            throw BadRequestException()
        }
        return moveDao.findByUserId(getUserId(), page, limit)
    }

    fun getNumberOfMoves(): Int {
        return moveDao.getNumberOfMoves(getUserId())
    }

}