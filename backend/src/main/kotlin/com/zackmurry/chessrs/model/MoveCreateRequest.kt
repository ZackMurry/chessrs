package com.zackmurry.chessrs.model

data class MoveCreateRequest(var fenBefore: String, var san: String, var uci: String, var fenAfter: String, var isWhite: Boolean)
