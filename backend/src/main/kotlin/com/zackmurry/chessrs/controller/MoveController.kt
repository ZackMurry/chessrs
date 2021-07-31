package com.zackmurry.chessrs.controller

import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.IdResponse
import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.model.MoveEntity
import com.zackmurry.chessrs.service.MoveService
import org.springframework.web.bind.annotation.*
import java.net.URLDecoder
import java.nio.charset.StandardCharsets
import java.util.*
import javax.servlet.http.HttpServletRequest

@RequestMapping("/api/v1/moves")
@RestController
class MoveController(private val moveService: MoveService) {

    @PostMapping("")
    fun createMove(@RequestBody request: MoveCreateRequest) = IdResponse(moveService.createMove(request))

    // todo: switch this endpoint to an SRS algorithm
    @GetMapping("/need-review")
    fun getMovesThatNeedReview(@RequestParam(required = false, defaultValue = "5") limit: Int) = moveService.getMovesThatNeedReview(limit)

    @GetMapping("/need-practice")
    fun getMovesThatNeedPractice(@RequestParam(required = false, defaultValue = "5") limit: Int) = moveService.getRandomMoves(limit)

    @GetMapping("/fen/**")
    fun getMoveByFen(request: HttpServletRequest): MoveEntity {
        // The wildcard is for the raw FEN
        val fen = request.requestURI.split("/api/v1/moves/fen/")[1]
        return moveService.getMoveByFen(URLDecoder.decode(fen, StandardCharsets.UTF_8))
    }

    @PostMapping("/study/{id}")
    fun studyMove(@PathVariable id: String, @RequestParam(required = true) success: Boolean) {
        val uuid = UUID.fromString(id) ?: throw BadRequestException()
        return moveService.studyMove(uuid, success)
    }

}