package com.zackmurry.chessrs

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ChesSRSApplication

fun main(args: Array<String>) {
    println("v2!")
    runApplication<ChesSRSApplication>(*args)
}
