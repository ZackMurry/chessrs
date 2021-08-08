package com.zackmurry.chessrs

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ChesSRSApplication

// todo: switch API to GraphQL
fun main(args: Array<String>) {
	runApplication<ChesSRSApplication>(*args)
}
