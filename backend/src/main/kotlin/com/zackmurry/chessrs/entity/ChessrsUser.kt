package com.zackmurry.chessrs.entity

import java.util.*
import jakarta.persistence.Entity
import jakarta.persistence.Id

@Entity
data class ChessrsUser(
    var username: String? = null,
    @Id var id: UUID? = null,
    var provider: String? = null,
    var easeFactor: Float? = null,
    var scalingFactor: Float? = null
)
