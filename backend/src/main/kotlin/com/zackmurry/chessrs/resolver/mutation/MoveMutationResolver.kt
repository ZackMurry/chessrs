package com.zackmurry.chessrs.resolver.mutation

import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.MoveResponse
import com.zackmurry.chessrs.service.MoveService
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.MutationMapping
import org.springframework.stereotype.Controller
import org.springframework.stereotype.Service
import java.util.*

@Controller
class MoveMutationResolver(val moveService: MoveService) {

    @MutationMapping
    fun createMove(@Argument fenBefore: String, @Argument san: String, @Argument uci: String, @Argument opening: String): MoveResponse {
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

    @MutationMapping
    fun reviewMove(@Argument id: String, @Argument success: Boolean): MoveResponse {
        val uuid = UUID.fromString(id)
        moveService.studyMove(uuid, success)
        return moveService.getMoveById(uuid).orElseThrow { BadRequestException() }.toResponse()
    }

    @MutationMapping
    fun deleteMove(@Argument id: String): MoveResponse {
        val uuid = UUID.fromString(id)
        val move = moveService.getMoveById(uuid).orElseThrow { BadRequestException() }
        moveService.deleteById(uuid)
        return move.toResponse()
    }

}
