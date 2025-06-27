package com.zackmurry.chessrs

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@SpringBootApplication
class ChesSRSApplication

fun main(args: Array<String>) {
    println("v5!")
    runApplication<ChesSRSApplication>(*args)
}
