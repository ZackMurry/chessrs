package com.zackmurry.chessrs.model

data class MoveCreateRequest(val fenBefore: String, val san: String, val uci: String, val isWhite: Boolean, val opening: String)
