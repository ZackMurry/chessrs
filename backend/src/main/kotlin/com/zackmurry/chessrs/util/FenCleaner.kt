package com.zackmurry.chessrs.util

import org.springframework.stereotype.Component
import org.springframework.stereotype.Service

@Component
class FenCleaner {

    /**
     * Removes the en passant square, half move counter and full move number from a FEN
     * Example: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 => rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -
     */
    fun cleanFen(fen: String): String {
        return fen.split(" ").stream().limit(3).toArray().joinToString(" ")
    }

}