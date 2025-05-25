package com.zackmurry.chessrs.resolver.query

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.zackmurry.chessrs.model.EngineAnalysisResult
import com.zackmurry.chessrs.model.LichessExplorerResponse
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.client.RestTemplate
import org.springframework.web.client.postForEntity
import org.springframework.web.util.UriComponentsBuilder


@Controller
class PositionQueryResolver(val restTemplate: RestTemplate, val redisTemplate: RedisTemplate<String, Any>) {

    private val mapper = ObjectMapper().registerKotlinModule()

    @QueryMapping
    fun positionInformation(@Argument fen: String): LichessExplorerResponse {
        val cacheKey = "fen:$fen"
        val cached = redisTemplate.opsForValue().get(cacheKey)

        if (cached is LinkedHashMap<*,*>) {
            // Found in cache
            val typed = mapper.convertValue(cached, LichessExplorerResponse::class.java)
            return typed
        }

        val baseUrl = "https://explorer.lichess.ovh/lichess"
        val uriBuilder = UriComponentsBuilder.fromUriString(baseUrl)
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
        val response: ResponseEntity<String> = restTemplate.getForEntity(url, String::class.java)
        val jsonString = response.body!!
        val result = mapper.readValue(jsonString, LichessExplorerResponse::class.java)
        redisTemplate.opsForValue().set("fen:$fen", result) // Add to cache
        return result
    }

    fun engineAnalysis(@Argument fen: String): EngineAnalysisResult {
        val baseUrl = "http://localhost/api/v1/engine/analyze"
        val uriBuilder = UriComponentsBuilder.fromUriString(baseUrl)
            .queryParam("depth", "20")
            .queryParam("fen", fen)
        val url = uriBuilder.build().toUriString()
        val response: ResponseEntity<String> = restTemplate.postForEntity(url, String::class.java)
        return EngineAnalysisResult(0f)
    }

}
