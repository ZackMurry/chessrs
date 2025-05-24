package com.zackmurry.chessrs.model

class LichessMove (val uci: String,
    val san: String,
    val averageRating: Int?,
    val white: Int?,
    val draws: Int?,
    val black: Int?,
    val opening: LichessOpening)
