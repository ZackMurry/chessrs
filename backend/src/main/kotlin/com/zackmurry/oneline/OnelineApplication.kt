package com.zackmurry.oneline

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class OnelineApplication

fun main(args: Array<String>) {
	runApplication<OnelineApplication>(*args)
}
