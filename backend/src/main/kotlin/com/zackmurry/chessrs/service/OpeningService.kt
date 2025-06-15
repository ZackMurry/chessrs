package com.zackmurry.chessrs.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.LichessExplorerResponse
import com.zackmurry.chessrs.resolver.query.LICHESS_OPENING_EXPLORER_URL
import com.zackmurry.chessrs.util.FenManager
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponentsBuilder
import reactor.netty.http.client.PrematureCloseException
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Service
class OpeningService(val restTemplate: RestTemplate, val redisTemplate: RedisTemplate<String, Any>, val fenManager: FenManager) {

    private val mapper = ObjectMapper().registerKotlinModule()

    fun getOpeningExplorerData(fen: String): LichessExplorerResponse {
        if (!fenManager.isValidFEN(fen)) {
            throw BadRequestException()
        }
        val cacheKey = "opening:$fen"
        val cached = redisTemplate.opsForValue().get(cacheKey)

        if (cached is LinkedHashMap<*,*>) {
            // Found in cache
            val typed = mapper.convertValue(cached, LichessExplorerResponse::class.java)
            return typed
        }

        val uriBuilder = UriComponentsBuilder.fromUriString(LICHESS_OPENING_EXPLORER_URL)
            .queryParam("variant", "standard")
            .queryParam("speeds[]", "bullet")
            .queryParam("speeds[]", "blitz")
            .queryParam("speeds[]", "rapid")
            .queryParam("speeds[]", "classical")
            .queryParam("ratings[]", "1600")
            .queryParam("ratings[]", "2500")
            .queryParam("moves", "6")
            .queryParam("fen", fen)

        val url = uriBuilder.build().toUriString()
        println("Fetching $url")
        val response: ResponseEntity<String>
        try {
            response = restTemplate.getForEntity(url, String::class.java)
        } catch (ex: HttpClientErrorException) {
            val statusCode = ex.statusCode
            println("Client error with status: $statusCode")
            println("Error body: ${ex.responseBodyAsString}")
            throw ex
        } catch (ex: HttpServerErrorException) {
            val statusCode = ex.statusCode
            println("Server error with status: $statusCode")
            println("Error body: ${ex.responseBodyAsString}")
            throw ex
        } catch (ex: PrematureCloseException) {
            println("Prematurely closed!")
            throw BadRequestException()
        }
        val jsonString = response.body!!
        val result = mapper.readValue(jsonString, LichessExplorerResponse::class.java)
        redisTemplate.opsForValue().set("fen:$fen", result) // Add to cache
        return result
    }
}