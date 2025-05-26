package com.zackmurry.chessrs.engine.controller

import com.zackmurry.chessrs.engine.model.AnalysisResponse
import org.apache.coyote.BadRequestException
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping
class EngineController {

    @GetMapping("/analyze")
    fun analyze(@RequestParam fen: String, @RequestParam depth: Int = 15): AnalysisResponse {
        if (depth <= 0 || depth > 35) {
            throw BadRequestException("Bad depth")
        }
        val fenParts = fen.split(' ')
        if (fen.length < 10 || fenParts.size < 2) {
            throw BadRequestException("Bad FEN")
        }
        // : Run Stockfish and get best move
        val stockfish = ProcessBuilder("stockfish").start()
        val writer = stockfish.outputStream.bufferedWriter()
        var bestMove = "none"
        val reader = stockfish.inputStream.bufferedReader()
        val toMove = fenParts[1]

        writer.write("uci\n")
        writer.write("position fen $fen\n")
        writer.write("go depth $depth\n")
        writer.flush()

        var cp = 0
        while (true) {
            val line = reader.readLine() ?: break
            println(line)
            if (line.startsWith("bestmove")) {
                bestMove = line.split(" ")[1]
                break
            } else if (line.startsWith("info")) {
                val map = parseInfoLine(line)
                println(map)
                if (map.containsKey("score cp") && map["score cp"] is Int) {
                    cp = map["score cp"] as Int
                }
            }
        }
        val eval = (cp / 100f) * (if (toMove == "w") 1 else -1)
        println("eval: $eval")
        return AnalysisResponse(eval, bestMove)
    }

    fun parseInfoLine(line: String): Map<String, Any> {
        val tokens = line.split(" ")
        val map = mutableMapOf<String, Any>()

        // Assuming the first token is "info", so start from index 1
        var i = 1
        while (i < tokens.size - 1) {
            var key = tokens[i]
            var value = tokens[i + 1]
            if (key == "lowerbound" || key == "upperbound") {
                i++
                continue
            }
            if (key == "score") {
                key = "score " + tokens[i+1]
                value = tokens[i+2]
                i++
            }


            // Try to parse value as Int, else keep as String
            val parsedValue = value.toIntOrNull() ?: value

            map[key] = parsedValue
            i += 2
        }
        return map
    }
}
