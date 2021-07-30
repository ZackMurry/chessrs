package com.zackmurry.chessrs.model

import java.util.*

data class UserEntity(val username: String, val id: UUID, val provider: String, val easeFactor: Float)
