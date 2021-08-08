package com.zackmurry.chessrs.model

import com.zackmurry.chessrs.entity.Move

data class NeedReviewResponse(val total: Int, val moves: List<Move>)
