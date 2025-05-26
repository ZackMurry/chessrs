package com.zackmurry.chessrs.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.core.io.ClassPathResource
import org.springframework.graphql.server.webmvc.GraphiQlHandler
import org.springframework.web.servlet.function.RouterFunction
import org.springframework.web.servlet.function.RouterFunctions
import org.springframework.web.servlet.function.ServerResponse

@Configuration
class GraphiQlConfiguration {

    @Bean
    @Order(0)
    fun graphiQlRouterFunction(): RouterFunction<ServerResponse> {
        var builder: RouterFunctions.Builder = RouterFunctions.route()
        val graphiQlPage = ClassPathResource("graphiql/index.html")
        val graphiQLHandler = GraphiQlHandler("/api/v1/graphql", "", graphiQlPage)
        builder = builder.GET("/api/v1/graphiql", graphiQLHandler::handleRequest)
        return builder.build()
    }
}
