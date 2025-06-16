package com.zackmurry.chessrs.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.exception.InternalServerException
import com.zackmurry.chessrs.model.*
import com.zackmurry.chessrs.util.FenManager
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder

const val LICHESS_CLOUD_ANALYSIS_URL = "https://lichess.org/api/cloud-eval"
const val CHESSRS_ENGINE_DEPTH = 30

private val logger = LoggerFactory.getLogger(EngineService::class.java)

@Service
class EngineService(private val restTemplate: RestTemplate,
                    val fenManager: FenManager,
                    val redisTemplate: RedisTemplate<String, Any>,
                    @Value("\${app.engine.url}")
                    val engineUrl: String) {

    private val mapper = ObjectMapper().registerKotlinModule()

    fun analyzePosition(fen: String): EngineAnalysisResult {
        if (!fenManager.isValidFEN(fen)) {
            throw BadRequestException()
        }
        val cacheKey = "engine:$fen"
        val cached = redisTemplate.opsForValue().get(cacheKey)

        if (cached is LinkedHashMap<*,*>) {
            // Found in cache
            val typed = mapper.convertValue(cached, EngineAnalysisResult::class.java)
            logger.debug("Cache hit")
            return typed
        }
        val lichessUriBuilder = UriComponentsBuilder.fromUriString(LICHESS_CLOUD_ANALYSIS_URL)
            .queryParam("fen", fen)
        val lichessUrl = lichessUriBuilder.build().toUriString()
        try {
            val lichessResponse: ResponseEntity<String> = restTemplate.getForEntity(lichessUrl, String::class.java)
            if (lichessResponse.statusCode.is2xxSuccessful) {
                val lichessJson = lichessResponse.body!!
                val lichessResult = mapper.readValue(lichessJson, LichessAnalysisResponse::class.java)
                if (lichessResult.pvs.isEmpty()) {
                    throw InternalServerException()
                }
                val bestMove = lichessResult.pvs[0]
                val engResult = EngineAnalysisResult(fen, lichessResult.depth, bestMove.cp / 100f,
                    bestMove.mate, lichessResult.pvs[0].moves, EngineAnalysisProvider.LICHESS)
                redisTemplate.opsForValue().set("engine:$fen", engResult) // Add to cache
                logger.debug("Lichess hit")
                return engResult
            }
        } catch (e: Exception) {
            // Ignore
        }

        val uriBuilder = UriComponentsBuilder.fromUriString(engineUrl)
            .queryParam("depth", CHESSRS_ENGINE_DEPTH.toString())
            .queryParam("fen", fen)
        val url = uriBuilder.build().toUriString()
        val response: ResponseEntity<String> = restTemplate.getForEntity(url, String::class.java)
        if (response.statusCode.is2xxSuccessful) {
            val jsonString = response.body!!
            val result = mapper.readValue(jsonString, ChessrsAnalysisResponse::class.java)
            val engResult = EngineAnalysisResult(fen, CHESSRS_ENGINE_DEPTH, result.eval, result.mate, result.bestmove, EngineAnalysisProvider.CHESSRS)
            redisTemplate.opsForValue().set("engine:$fen", engResult) // Add to cache
            logger.debug("Local engine hit")
            return engResult
        }
        throw InternalServerException()
    }

}