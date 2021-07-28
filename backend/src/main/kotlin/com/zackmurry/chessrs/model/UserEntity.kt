package com.zackmurry.chessrs.model

import java.util.*

data class UserEntity(var username: String, var id: UUID, var provider: String)
