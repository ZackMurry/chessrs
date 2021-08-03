package com.zackmurry.chessrs

import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.exception.NoContentException
import com.zackmurry.chessrs.exception.NotFoundException
import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.model.UserEntity
import com.zackmurry.chessrs.security.AuthProvider
import com.zackmurry.chessrs.security.UserPrincipal
import com.zackmurry.chessrs.service.DEFAULT_EASE
import com.zackmurry.chessrs.service.MoveService
import com.zackmurry.chessrs.service.UserService
import org.apache.commons.lang3.RandomStringUtils
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import java.util.*
import kotlin.collections.ArrayList

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@SpringBootTest
class MoveServiceTest {

    @Autowired
    private lateinit var moveService: MoveService

    @Autowired
    private lateinit var userService: UserService

    private var testUsername: String = ""

    @BeforeEach
    fun createTestUser() {
        testUsername = "__TEST__" + RandomStringUtils.randomAlphanumeric(12)

        if (userService.accountExists(testUsername)) {
            createTestUser()
        } else {
            val user = UserEntity(testUsername, UUID.randomUUID(), AuthProvider.LICHESS.toString(), DEFAULT_EASE)
            userService.createUser(user)
            val userPrincipal = UserPrincipal.create(user)
            val token = UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.authorities)
            SecurityContextHolder.getContext().authentication = token
        }
    }

    @AfterEach
    fun deleteTestUser() {
        userService.delete(testUsername)
    }

    @DisplayName("Create move")
    @Test
    fun testCreateMove() {
        for (i in 1..100) {
            val move = MoveCreateRequest(
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    RandomStringUtils.randomAlphanumeric(3, 5),
                    RandomStringUtils.randomAlphanumeric(4),
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    i % 2 == 0)
            val id = moveService.createMove(move).id
            val createdMove = moveService.getMoveById(id)
            assertEquals(id, createdMove.id)
            assertEquals(move.fenBefore, createdMove.fenBefore)
            assertEquals(move.uci, createdMove.uci)
            assertEquals(move.san, createdMove.san)
            assertEquals(move.fenAfter, createdMove.fenAfter)
        }

        assertThrows<BadRequestException>("A move with a starting FEN with > 90 chars is invalid") {
            moveService.createMove(
                MoveCreateRequest(
                    RandomStringUtils.randomAlphanumeric(91),
                    RandomStringUtils.randomAlphanumeric(3, 5),
                    RandomStringUtils.randomAlphanumeric(4),
                    RandomStringUtils.randomAlphanumeric(91),
                    true
                )
            )
        }

        assertThrows<BadRequestException>("A move with a ending FEN with > 90 chars is invalid") {
            moveService.createMove(
                MoveCreateRequest(
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    RandomStringUtils.randomAlphanumeric(3, 5),
                    RandomStringUtils.randomAlphanumeric(4),
                    RandomStringUtils.randomAlphanumeric(91),
                    true
                )
            )
        }

        assertThrows<BadRequestException>("A move with a SAN with > 5 chars is invalid") {
            moveService.createMove(
                MoveCreateRequest(
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    RandomStringUtils.randomAlphanumeric(6),
                    RandomStringUtils.randomAlphanumeric(4),
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    true
                )
            )
        }

        assertThrows<BadRequestException>("A move with a UCI with > 4 chars is invalid") {
            moveService.createMove(
                MoveCreateRequest(
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    RandomStringUtils.randomAlphanumeric(3, 5),
                    RandomStringUtils.randomAlphanumeric(5),
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    true
                )
            )
        }
    }

    @DisplayName("Delete move")
    @Test
    fun testDeleteMove() {
        for (i in 1..10) {
            val move = MoveCreateRequest(
                RandomStringUtils.randomAlphanumeric(30, 90),
                RandomStringUtils.randomAlphanumeric(3, 5),
                RandomStringUtils.randomAlphanumeric(4),
                RandomStringUtils.randomAlphanumeric(30, 90),
                i % 2 == 0
            )
            val id = moveService.createMove(move).id
            moveService.deleteById(id)
            assertThrows<NotFoundException>("Getting a deleted move by id should produce a NotFoundException") { moveService.getMoveById(id) }
            assertThrows<NoContentException>("Getting a deleted move by FEN should produce a NoContentException") { moveService.getMoveByFen(move.fenBefore) }
        }
        var id = UUID.randomUUID()
        // Making sure that there aren't any moves with this id lol
        while (true) {
            try {
                moveService.getMoveById(id)
                id = UUID.randomUUID()
            } catch (_: Exception) {
                break
            }
        }
        assertThrows<NotFoundException>("Deleting a non-existent move should produce a NotFoundException") { moveService.deleteById(id) }
    }

    @DisplayName("Study move")
    @Test
    fun testStudyMove() {
        for (i in 1..10) {
            val move = MoveCreateRequest(
                RandomStringUtils.randomAlphanumeric(30, 90),
                RandomStringUtils.randomAlphanumeric(3, 5),
                RandomStringUtils.randomAlphanumeric(4),
                RandomStringUtils.randomAlphanumeric(30, 90),
                i % 2 == 0
            )
            val id = moveService.createMove(move).id
            var createdMove = moveService.getMoveById(id)
            assertEquals(0, createdMove.numReviews, "A newly created move should have 0 reviews")
            assertTrue(createdMove.due <= System.currentTimeMillis(), "A newly created move should be due")

            moveService.studyMove(id, true)
            createdMove = moveService.getMoveById(id)
            assertEquals(1, createdMove.numReviews, "A move that has been successfully studied once should have one review")
            assertTrue(createdMove.due > System.currentTimeMillis(), "A move that has just been studied should not be due")

            moveService.studyMove(id, false)
            createdMove = moveService.getMoveById(id)
            assertEquals(0, createdMove.numReviews, "A move that has just been forgotten should have 0 reviews")
            assertTrue(createdMove.numReviews <= System.currentTimeMillis(), "A move that has just been forgotten should be due")
        }
    }

    @DisplayName("Random moves")
    @Test
    fun testRandomMoves() {
        val moveIds = ArrayList<UUID>()
        for (i in 1..25) {
            moveIds.add(moveService.createMove(
                MoveCreateRequest(
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    RandomStringUtils.randomAlphanumeric(3, 5),
                    RandomStringUtils.randomAlphanumeric(4),
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    i % 2 == 0
                )
            ).id)
        }

        for (i in 1..25) {
            val randomMoves = moveService.getRandomMoves(5)
            assertEquals(5, randomMoves.size, "5 random moves should be returned from ")
            for (rm in randomMoves) {
                assertTrue(moveIds.contains(rm.id), "Random moves should be valid moves created by the user")
            }
        }
    }

    @DisplayName("Due moves")
    @Test
    fun testDueMoves() {
        for (i in 1..10) {
            val moveIds = ArrayList<UUID>()
            for (j in 1..25) {
                moveIds.add(moveService.createMove(
                    MoveCreateRequest(
                        RandomStringUtils.randomAlphanumeric(30, 90),
                        RandomStringUtils.randomAlphanumeric(3, 5),
                        RandomStringUtils.randomAlphanumeric(4),
                        RandomStringUtils.randomAlphanumeric(30, 90),
                        j % 2 == 0
                    )
                ).id)
            }

            var dueMoves = moveService.getMovesThatNeedReview(5)
            assertEquals(5, dueMoves.moves.size, "Getting due moves should return limit moves when total >= limit")
            assertEquals(25, dueMoves.total, "The total moves due should be accurate")
            for (move in dueMoves.moves) {
                moveService.studyMove(move.id, true)
            }

            dueMoves = moveService.getMovesThatNeedReview(5)
            assertEquals(5, dueMoves.moves.size, "Getting due moves should return limit moves when total >= limit")
            assertEquals(20, dueMoves.total, "The total moves due should be accurate")
            for (move in dueMoves.moves) {
                moveService.studyMove(move.id, true)
            }

            dueMoves = moveService.getMovesThatNeedReview(5)
            assertEquals(5, dueMoves.moves.size, "Getting due moves should return limit moves when total >= limit")
            assertEquals(15, dueMoves.total, "The total moves due should be accurate")
            for (move in dueMoves.moves) {
                moveService.studyMove(move.id, true)
            }

            dueMoves = moveService.getMovesThatNeedReview(5)
            assertEquals(5, dueMoves.moves.size, "Getting due moves should return limit moves when total >= limit")
            assertEquals(10, dueMoves.total, "The total moves due should be accurate")
            for (move in dueMoves.moves) {
                moveService.studyMove(move.id, true)
            }

            dueMoves = moveService.getMovesThatNeedReview(3)
            assertEquals(3, dueMoves.moves.size, "Getting due moves should return limit moves when total >= limit")
            assertEquals(5, dueMoves.total, "The total moves due should be accurate")
            for (move in dueMoves.moves) {
                moveService.studyMove(move.id, true)
            }

            dueMoves = moveService.getMovesThatNeedReview(2)
            assertEquals(2, dueMoves.moves.size, "Getting due moves should return limit moves when total >= limit")
            assertEquals(2, dueMoves.total, "The total moves due should be accurate")
            for (move in dueMoves.moves) {
                moveService.studyMove(move.id, true)
            }

            dueMoves = moveService.getMovesThatNeedReview(5)
            assertEquals(0, dueMoves.moves.size, "Getting due moves should return no moves when there are no moves due")
            assertEquals(0, dueMoves.total, "The total moves due should be accurate")
            for (id in moveIds) {
                moveService.deleteById(id)
            }
        }
    }

    @DisplayName("Get move by FEN")
    @Test
    fun testGetMovesByFen() {
        val moveIds = ArrayList<UUID>()
        for (i in 1..25) {
            moveIds.add(moveService.createMove(
                MoveCreateRequest(
                    RandomStringUtils.randomAlphanumeric(90),
                    RandomStringUtils.randomAlphanumeric(3, 5),
                    RandomStringUtils.randomAlphanumeric(4),
                    RandomStringUtils.randomAlphanumeric(30, 90),
                    i % 2 == 0
                )
            ).id)
        }

        for (id in moveIds) {
            val move = moveService.getMoveById(id)
            val fenMove = moveService.getMoveByFen(move.fenBefore)
            assertEquals(move, fenMove, "Getting a move by FEN should return the same data as getting it by id")
        }

        for (i in 1..10) {
            assertThrows<NoContentException>("Getting a move that doesn't exist by FEN should produce a NoContentException"){ moveService.getMoveByFen(RandomStringUtils.randomAlphanumeric(30, 89)) }
        }
    }

    @DisplayName("Get move by id")
    @Test
    fun testGetMoveById() {
        val moveIds = ArrayList<UUID>()
        val moves = ArrayList<MoveCreateRequest>()
        for (i in 1..25) {
            val move = MoveCreateRequest(
                RandomStringUtils.randomAlphanumeric(30, 90),
                RandomStringUtils.randomAlphanumeric(3, 5),
                RandomStringUtils.randomAlphanumeric(4),
                RandomStringUtils.randomAlphanumeric(30, 90),
                i % 2 == 0
            )
            moves.add(move)
            moveIds.add(moveService.createMove(move).id)
        }

        for (i in 0..24) {
            val move = moves[i]
            val id = moveIds[i]
            val returnedMove = moveService.getMoveById(id)
            assertEquals(id, returnedMove.id)
            assertEquals(move.fenBefore, returnedMove.fenBefore)
            assertEquals(move.uci, returnedMove.uci)
            assertEquals(move.san, returnedMove.san)
            assertEquals(move.fenAfter, returnedMove.fenAfter)
        }
    }

}