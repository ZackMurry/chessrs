package com.zackmurry.chessrs.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
class LichessExplorerResponse(val white: Long,
    val draws: Long,
    val black: Long,
    val moves: List<LichessMove>?,
    val opening: LichessOpening?)

