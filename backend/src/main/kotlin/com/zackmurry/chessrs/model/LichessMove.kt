package com.zackmurry.chessrs.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
class LichessMove (val uci: String,
    val san: String,
    val averageRating: Int?,
    val white: Long?,
    val draws: Long?,
    val black: Long?,
    val opening: LichessOpening?)
