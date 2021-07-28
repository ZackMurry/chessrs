package com.zackmurry.chessrs.service

import com.zackmurry.chessrs.dao.move.MoveDao
import com.zackmurry.chessrs.exception.BadRequestException
import com.zackmurry.chessrs.model.MoveCreateRequest
import com.zackmurry.chessrs.security.UserPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class MoveService(private val moveDao: MoveDao) {

    fun createMove(request: MoveCreateRequest) {
        if (request.fenBefore.length > 90 || request.fenAfter.length > 90 || request.san.length > 5 || request.uci.length > 4) {
            throw BadRequestException()
        }
        moveDao.createMove(request, (SecurityContextHolder.getContext().authentication.principal as UserPrincipal).getId())
    }

}