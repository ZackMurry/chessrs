package com.zackmurry.chessrs.resolver.mutation

import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.MoveResponse
import com.zackmurry.chessrs.service.MoveService
import graphql.kickstart.tools.GraphQLMutationResolver
import org.springframework.stereotype.Service
import java.util.*

@Service
class MoveMutationResolver(val moveService: MoveService) : GraphQLMutationResolver {

    fun createMove(fenBefore: String, san: String, uci: String, opening: String): MoveResponse {
        val fenParts = fenBefore.split(" ")
        if (fenParts.size < 3) {
            throw BadRequestException()
        }
        val isWhite = fenParts[1] == "w"
        if (!isWhite && fenParts[1] != "b") {
            throw BadRequestException()
        }
        return moveService.createMove(fenBefore, san, uci, isWhite, opening).toResponse()
    }

    fun reviewMove(id: String, success: Boolean): MoveResponse {
        val uuid = UUID.fromString(id)
        moveService.studyMove(uuid, success)
        return moveService.getMoveById(uuid).orElseThrow { BadRequestException() }.toResponse()
    }

    fun deleteMove(id: String): MoveResponse {
        val uuid = UUID.fromString(id)
        val move = moveService.getMoveById(uuid).orElseThrow { BadRequestException() }
        moveService.deleteById(uuid)
        return move.toResponse()
    }

}
