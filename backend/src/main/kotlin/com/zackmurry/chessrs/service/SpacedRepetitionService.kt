package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import kotlin.math.pow

// todo: allow scaling factor to be configured
const val SCALING_FACTOR = 2.0
const val DEFAULT_EASE = 3f

@Service
class SpacedRepetitionService {

    /**
     * Calculates the next time that a move should be reviewed after a successful review
     * @param numReviews Number of consecutive successful reviews prior to this review
     * @return The number of milliseconds until the next review
     */
    fun calculateNextDueInterval(numReviews: Int): Long {
        val easeFactor = (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).getEaseFactor()
        return (easeFactor * SCALING_FACTOR.pow(numReviews) * 1000 * 60).toLong()
    }

}