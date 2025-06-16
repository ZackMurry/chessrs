package com.zackmurry.chessrs

import com.zackmurry.chessrs.util.FenManager
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest
class FenManagerTest {

//    @Autowired
//    private lateinit var fenManager: FenManager
//
//    @DisplayName("Cleaning fen")
//    @Test
//    fun testCleaningFen() {
//        assertEquals(
//            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq",
//            fenManager.cleanFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
//        )
//        assertEquals(
//            "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq",
//            fenManager.cleanFen("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1")
//        )
//        assertEquals(
//            "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq",
//            fenManager.cleanFen("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2")
//        )
//    }
//
}