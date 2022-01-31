package com.zackmurry.chessrs.model

import org.springframework.security.core.GrantedAuthority
import java.util.*

data class LichessPerf(val games: Int, val rating: Int, val rd: Int, val prog: Int, val prov: Boolean?) {

    companion object {
        fun fromMap(map: MutableMap<String, Any>?): LichessPerf? {
            return if (map != null) {
                LichessPerf(
                        map["games"] as Int,
                        map["rating"] as Int,
                        map["rd"] as Int,
                        map["prog"] as Int,
                        map["prov"] as Boolean?
                )
            } else {
                null
            }
        }
    }

}

data class LichessRacer(val runs: Int, val score: Int) {

    companion object {
        fun fromMap(map: MutableMap<String, Any>?): LichessRacer? {
            return if (map != null) {
                LichessRacer(
                        map["runs"] as Int,
                        map["score"] as Int
                )
            } else {
                null
            }
        }
    }

}

data class LichessPerfs(
    val chess960: LichessPerf?,
    val antichess: LichessPerf?,
    val puzzle: LichessPerf?,
    val atomic: LichessPerf?,
    val blitz: LichessPerf?,
    val crazyhouse: LichessPerf?,
    val threeCheck: LichessPerf?,
    val bullet: LichessPerf?,
    val correspondence: LichessPerf?,
    val classical: LichessPerf?,
    val rapid: LichessPerf?,
    val storm: LichessRacer?,
    val racer: LichessRacer?,
    val streak: LichessRacer?
) {
    companion object {
        @Suppress("UNCHECKED_CAST")
        fun fromMap(map: MutableMap<String, Any>): LichessPerfs {
            return LichessPerfs(
                LichessPerf.fromMap(map["chess960"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["antichess"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["puzzle"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["atomic"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["blitz"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["crazyhouse"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["threeCheck"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["bullet"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["correspondence"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["classical"] as MutableMap<String, Any>?),
                LichessPerf.fromMap(map["rapid"] as MutableMap<String, Any>?),
                LichessRacer.fromMap(map["storm"] as MutableMap<String, Any>?),
                LichessRacer.fromMap(map["racer"] as MutableMap<String, Any>?),
                LichessRacer.fromMap(map["streak"] as MutableMap<String, Any>?),
            )
        }
    }
}

data class LichessPlayTime(val total: Int, val tv: Int) {
    companion object {
        fun fromMap(map: MutableMap<String, Any>) = LichessPlayTime(map["total"] as Int, map["tv"] as Int)
    }
}

data class LichessAttributes(
    val id: String,
    val username: String,
    val online: Boolean,
    val perfs: LichessPerfs,
    val createdAt: String,
    val seenAt: String,
    val playTime: LichessPlayTime,
    val language: String,
    val url: String,
    val nbFollowing: Int,
    val nbFollowers: Int,
    val completionRate: Int,
    val followable: Boolean,
    val following: Boolean,
    val blocking: Boolean,
    val followsYou: Boolean
) {

    companion object {
        @Suppress("UNCHECKED_CAST")
        fun fromMap(map: MutableMap<String, Any>): LichessAttributes {
            val perfs = LichessPerfs.fromMap(map["perfs"] as MutableMap<String, Any>)
            val playTime = LichessPlayTime.fromMap(map["playTime"] as MutableMap<String, Any>)
            return LichessAttributes(
                map["id"] as String,
                map["username"] as String,
                map["online"] as Boolean,
                perfs,
                map["createdAt"].toString(),
                map["seenAt"].toString(),
                playTime,
                (map["language"] ?: "en") as String,
                map["url"] as String,
                (map["nbFollowing"] ?: 0) as Int,
                (map["nbFollowers"] ?: 0) as Int,
                (map["completionRate"] ?: 1) as Int,
                (map["followable"] ?: false) as Boolean,
                (map["following"] ?: false) as Boolean,
                (map["blocking"] ?: false) as Boolean,
                (map["followsYou"] ?: false) as Boolean
            )
        }

    }


}

data class AuthorityResponse(val authority: String)

class UserPrincipalResponse(
    val username: String,
    uuid: UUID,
    authoritiesMap: MutableCollection<out GrantedAuthority>,
    attributesMap: MutableMap<String, Any>,
    var easeFactor: Float,
    var scalingFactor: Float,
    val enabled: Boolean,
    val accountNonLocked: Boolean,
    val accountNonExpired: Boolean,
    val credentialsNonExpired: Boolean,
    val name: String
) {
    val id = uuid.toString()
    val authorities = authoritiesMap.map { AuthorityResponse(it.authority) }
    val attributes = LichessAttributes.fromMap(attributesMap)
}
