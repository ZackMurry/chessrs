package com.zackmurry.chessrs.controller

import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.service.MoveService
import org.springframework.web.bind.annotation.*
import java.util.*

@RequestMapping("/api/v1/moves")
@RestController
class MoveController(private val moveService: MoveService) {

    @PostMapping("")
    fun createMove(@RequestBody request: MoveCreateRequest) = moveService.createMove(request)

    // todo: switch this endpoint to an SRS algorithm
    @GetMapping("/need-review")
    fun getMovesThatNeedReview(@RequestParam(required = false, defaultValue = "5") limit: Int) = moveService.getMovesThatNeedReview(limit)

    @GetMapping("/need-practice")
    fun getMovesThatNeedPractice(@RequestParam(required = false, defaultValue = "5") limit: Int) = moveService.getRandomMoves(limit)

}