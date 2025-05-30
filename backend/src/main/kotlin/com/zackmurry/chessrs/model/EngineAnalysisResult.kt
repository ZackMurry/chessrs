package com.zackmurry.chessrs.model

class EngineAnalysisResult(val fen: String,
    val depth: Int,
    val eval: Float?,
    val mate: Int?,
    val mainLine: String?,
    val provider: EngineAnalysisProvider)
