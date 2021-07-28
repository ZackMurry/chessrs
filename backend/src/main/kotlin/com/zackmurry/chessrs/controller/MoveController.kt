package com.zackmurry.chessrs.controller

import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.service.MoveService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RequestMapping("/api/v1/moves")
@RestController
class MoveController(private val moveService: MoveService) {

    @PostMapping("")
    fun createMove(@RequestBody request: MoveCreateRequest) {
        moveService.createMove(request)
    }

}