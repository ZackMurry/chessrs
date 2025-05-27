package com.zackmurry.chessrs.resolver.query

import com.zackmurry.chessrs.model.EngineAnalysisResult
import com.zackmurry.chessrs.model.LichessExplorerResponse
import com.zackmurry.chessrs.service.EngineService
import com.zackmurry.chessrs.service.OpeningService
import com.zackmurry.chessrs.util.FenManager
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Controller

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
