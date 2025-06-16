package com.zackmurry.chessrs.engine

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ChessrsEngineApplication

fun main(args: Array<String>) {
	println("Engine Service!!!!")
	runApplication<ChessrsEngineApplication>(*args)
}
