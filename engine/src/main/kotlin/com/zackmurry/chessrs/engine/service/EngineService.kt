package com.zackmurry.chessrs.engine.service

import com.zackmurry.chessrs.engine.config.EngineProperties
import com.zackmurry.chessrs.engine.model.AnalysisResponse
import org.apache.coyote.BadRequestException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

private val logger = LoggerFactory.getLogger(EngineService::class.java)

@Service
class EngineService(
    private val engineProperties: EngineProperties
) {

    fun analyzeFen(fen: String, depth: Int): AnalysisResponse {
        if (depth <= 0 || depth > 35) {
            throw BadRequestException("Bad depth")
        }
        val fenParts = fen.split(' ')
        if (fen.length < 10 || fenParts.size < 2) {
            throw BadRequestException("Bad FEN")
        }
        // : Run Stockfish and get best move
        val stockfish = ProcessBuilder(engineProperties.stockfishPath).start()
        val writer = stockfish.outputStream.bufferedWriter()
        var bestMove = "none"
        val reader = stockfish.inputStream.bufferedReader()
        val toMove = fenParts[1]

        writer.write("uci\n")
        writer.write("position fen $fen\n")
        writer.write("go depth $depth\n")
        writer.flush()

        var cp: Int? = null
        var mate: Int? = null
        while (true) {
            val line = reader.readLine() ?: break
            println(line)
            logger.debug(line)
            if (line.startsWith("bestmove")) {
                bestMove = line.split(" ")[1]
                break
            } else if (line.startsWith("info")) {
                val map = parseInfoLine(line)
                val temp = map.keys
                println(temp)
                if (map.containsKey("score mate") && map["score mate"] is Int) {
                    cp = null
                    mate = map["score mate"] as Int
                } else if (map.containsKey("score cp") && map["score cp"] is Int) {
                    cp = map["score cp"] as Int
                }
            }
        }
        stockfish.destroy()
        writer.flush()
        writer.close()
        reader.close()
        val sign = if (toMove == "w") 1 else -1
        val eval = cp?.let {
            sign * (cp / 100f)
        }
        mate = if (mate != null) sign * mate else null
        println("eval: $eval")
        return AnalysisResponse(eval, mate, bestMove)
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