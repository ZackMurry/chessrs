package com.zackmurry.chessrs.entity

import java.util.*
import javax.persistence.Entity
import javax.persistence.Id

@Entity
data class Move(var fenBefore: String? = null,
           var san: String? = null,
           var uci: String? = null,
           var fenAfter: String? = null,
           var isWhite: Boolean? = null,
           @Id var id: UUID? = null,
           var userId: UUID? = null,
           var lastReviewed: Long? = null,
           var timeCreated: Long? = null,
           var numReviews: Int? = null,
           var due: Long? = null)
