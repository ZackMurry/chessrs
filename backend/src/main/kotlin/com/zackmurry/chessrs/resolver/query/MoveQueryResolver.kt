package com.zackmurry.chessrs.resolver.query

import com.zackmurry.chessrs.entity.Move
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.MoveResponse
import com.zackmurry.chessrs.service.MoveService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller
import java.util.*

@Controller
class MoveQueryResolver(val moveService: MoveService) {

    @QueryMapping
    fun move(@Argument id: String?, @Argument fenBefore: String?): Optional<MoveResponse> {
        return when {
            id != null -> moveService.getMoveById(UUID.fromString(id)).map { it.toResponse() }
            fenBefore != null -> moveService.getMoveByCleanFen(fenBefore).map { it.toResponse() }
            else -> throw BadRequestException()
        }
    }

    @QueryMapping
    fun dueMoves(@Argument limit: Int?) = moveService.getDueMoves(limit ?: 5).map(Move::toResponse)

    @QueryMapping
    fun numberOfDueMoves() = moveService.getNumberOfDueMoves()

    @QueryMapping
    fun randomMoves(@Argument limit: Int?) = moveService.getRandomMoves(limit ?: 5).map(Move::toResponse)

    @QueryMapping
    fun moves(@Argument page: Int?, @Argument limit: Int?) = moveService.getMoves(page ?: 0, limit ?: 50).map(Move::toResponse)

    @QueryMapping
    fun numberOfMoves() = moveService.getNumberOfMoves()

}
