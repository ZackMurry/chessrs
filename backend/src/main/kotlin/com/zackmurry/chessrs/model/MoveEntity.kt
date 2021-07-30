package com.zackmurry.chessrs.model

import java.util.*

data class MoveEntity(var fenBefore: String,
                      val san: String,
                      val uci: String,
                      val fenAfter: String,
                      val isWhite: Boolean,
                      val id: UUID,
                      val userId: UUID,
                      val lastReviewed: Long,
                      val timeCreated: Long,
                      val numReviews: Int,
                      val due: Long)
