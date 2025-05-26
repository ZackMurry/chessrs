package com.zackmurry.chessrs.resolver.query

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.ChessrsAnalysisResponse
import com.zackmurry.chessrs.model.EngineAnalysisResult
import com.zackmurry.chessrs.model.LichessExplorerResponse
import com.zackmurry.chessrs.service.EngineService
import com.zackmurry.chessrs.service.OpeningService
import com.zackmurry.chessrs.util.FenManager
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder


val LICHESS_OPENING_EXPLORER_URL = "https://explorer.lichess.ovh/lichess"

@Controller
class PositionQueryResolver(val engineService: EngineService, val openingService: OpeningService, val fenManager: FenManager) {


    @QueryMapping
    fun positionInformation(@Argument fen: String): LichessExplorerResponse {
        return openingService.getOpeningExplorerData(fen)
    }

    @QueryMapping
    fun engineAnalysis(@Argument fen: String): EngineAnalysisResult {
        return engineService.analyzePosition(fen)
    }

}
