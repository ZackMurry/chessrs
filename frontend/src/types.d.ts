export interface MoveEntity {
  fenBefore: string
  san: string
  uci: string
  isWhite: boolean
  id: string
  userId: string
  lastReviewed: number
  timeCreated: number
  numReviews: number
  opening: string
}

export interface UserPerf {
  games: number
  rating: number
  rd: number
  prog: number
  prov?: boolean
}

export interface UserPerfs {
  chess960: UserPerf
  antichess: UserPerf
  puzzle: UserPerf
  atomic: UserPerf
  blitz: UserPerf
  crazyhouse: UserPerf
  threeCheck: UserPerf
  bullet: UserPerf
  correspondence: UserPerf
  classical: UserPerf
  rapid: UserPerf
  storm: UserRacer
  racer: UserRacer
  streak: UserRacer
}

export interface UserRacer {
  runs: number
  score: number
}

export interface PlayTime {
  total: number
  tv: number
}

export interface Attributes {
  id: string
  username: string
  online: boolean
  perfs: UserPerfs
  createdAt: number
  seenAt: number
  playTime: PlayTime
  language: string
  url: string
  nbFollowing: number
  nbFollowers: number
  completionRate: number
  count: { [key: string]: number }
  followable: boolean
  following: boolean
  blocking: boolean
  followsYou: boolean
}

export interface Authority {
  authority: string
}

export interface UserData {
  username: string
  id: string
  authorities: Authority[]
  attributes: Attributes
  easeFactor: number
  scalingFactor: number
  enabled: boolean
  password: null
  accountNonLocked: boolean
  accountNonExpired: boolean
  credentialsNonExpired: boolean
  name: string
  isDemo: boolean
}

interface LichessPlayerUser {
  name: string
  id: string
}

interface LichessPlayer {
  user: LichessPlayerUser
  rating: number
  provisional: boolean
}

export interface LichessGame {
  id: string
  rated: boolean
  variant: string
  speed: string
  perf: string
  createdAt: number
  lastMoveAt: number
  players: {
    white: LichessPlayer
    black: LichessPlayer
  }
  winner: 'white' | 'black'
  moves: string
  pgn: string
  opening?: {
    eco: string
    name: string
    ply: number
  }
}

export interface LichessStudy {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
