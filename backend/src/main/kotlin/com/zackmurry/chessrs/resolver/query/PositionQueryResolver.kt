package com.zackmurry.chessrs.resolver.query

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.zackmurry.chessrs.model.LichessExplorerResponse
import org.springframework.graphql.data.method.annotation.Argument
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.client.RestTemplate
import org.springframework.web.util.UriComponents
import org.springframework.web.util.UriComponentsBuilder
import java.util.*


@Controller
class PositionQueryResolver(val restTemplate: RestTemplate) {

    @QueryMapping
    fun positionInformation(@Argument fen: String): LichessExplorerResponse {
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
        val mapper = ObjectMapper().registerKotlinModule()
        return mapper.readValue(jsonString, LichessExplorerResponse::class.java)
    }

}
