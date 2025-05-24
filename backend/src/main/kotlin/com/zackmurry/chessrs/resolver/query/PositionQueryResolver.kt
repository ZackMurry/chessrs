package com.zackmurry.chessrs.resolver.query

import com.zackmurry.chessrs.entity.Move
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.LichessExplorerResponse
import com.zackmurry.chessrs.model.MoveResponse
import com.zackmurry.chessrs.service.MoveService
import org.springframework.graphql.data.method.annotation.QueryMapping
import org.springframework.stereotype.Service
import java.util.*

@Service
class PositionQueryResolver(val moveService: MoveService) {

//    @QueryMapping
//    fun positionInformation(fen: String): LichessExplorerResponse {
//        return LichessExplorerResponse()
// }

}
