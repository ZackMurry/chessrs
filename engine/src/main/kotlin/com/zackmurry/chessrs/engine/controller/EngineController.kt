package com.zackmurry.chessrs.engine.controller

import com.zackmurry.chessrs.engine.model.AnalysisResponse
import com.zackmurry.chessrs.engine.service.EngineService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping
class EngineController(val engineService: EngineService) {

    @GetMapping("/analyze")
    fun analyze(@RequestParam fen: String, @RequestParam depth: Int = 15): AnalysisResponse {
        return engineService.analyzeFen(fen, depth)
    }
}
