package com.zackmurry.chessrs.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
class LichessAnalysisResponse(val fen: String,
    val depth: Int,
    val pvs: List<LichessVariation>)
