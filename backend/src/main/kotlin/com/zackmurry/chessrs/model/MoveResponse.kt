package com.zackmurry.chessrs.model

import java.util.*

class MoveResponse(
    val fenBefore: String,
    val san: String,
    val uci: String,
    val isWhite: Boolean,
    _id: UUID,
    _userId: UUID,
    _lastReviewed: Long,
    _timeCreated: Long,
    val numReviews: Int,
    _due: Long,
    val opening: String,
    val cleanFen: String
) {
    val id = _id.toString()
    val userId = _userId.toString()
    val lastReviewed = _lastReviewed.toString()
    val timeCreated = _timeCreated.toString()
    val due = _due.toString()
}
