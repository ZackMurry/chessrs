package com.zackmurry.chessrs.util

import org.springframework.stereotype.Component

@Component
class FenManager {

    /**
     * Removes the en passant square, half move counter and full move number from a FEN
     * Example: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 => rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -
     */
    fun cleanFen(fen: String): String {
        return fen.split(" ").stream().limit(3).toArray().joinToString(" ")
    }

    fun isValidFEN(fen: String): Boolean {
        val fenPattern = Regex("""^([rnbqkpRNBQKP1-8]{1,8}/){7}[rnbqkpRNBQKP1-8]{1,8} [wb] (-|[KQkq]{1,4}) (-|[a-h][36]) \d+ \d+$""")
        return fenPattern.matches(fen.trim())
    }

}