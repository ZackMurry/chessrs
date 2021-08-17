package com.zackmurry.chessrs.resolver.query

import com.zackmurry.chessrs.entity.Move
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.MoveResponse
import com.zackmurry.chessrs.service.MoveService
import graphql.kickstart.tools.GraphQLQueryResolver
import org.springframework.stereotype.Service
import java.util.*

@Service
class MoveQueryResolver(val moveService: MoveService) : GraphQLQueryResolver {

    fun move(id: String?, fenBefore: String?): Optional<MoveResponse> {
        return when {
            id != null -> moveService.getMoveById(UUID.fromString(id)).map { it.toResponse() }
            fenBefore != null -> moveService.getMoveByCleanFen(fenBefore).map { it.toResponse() }
            else -> throw BadRequestException()
        }
    }

    fun dueMoves(limit: Int?) = moveService.getDueMoves(limit ?: 5).map(Move::toResponse)

    fun numberOfDueMoves() = moveService.getNumberOfDueMoves()

    fun randomMoves(limit: Int?) = moveService.getRandomMoves(limit ?: 5).map(Move::toResponse)

    fun moves(page: Int?, limit: Int?) = moveService.getMoves(page ?: 0, limit ?: 50).map(Move::toResponse)

    fun numberOfMoves() = moveService.getNumberOfMoves()

}
