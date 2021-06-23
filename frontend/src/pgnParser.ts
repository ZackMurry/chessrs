interface PGNData {
  moves: string[]
  pgn: string
}

// Based off of https://github.com/augerm/lichess-pgn-parser but I removed stuff that I don't need (like moment)
export class PGN {
  public moveTimings: number[] | null
  public pgn: string
  public moves: string[]
  public timeControl: { white: number; black: number }

  constructor(pgnStr: string) {
    this.pgn = pgnStr
    this.moves = this.parseMoves()
  }

  parseMoves() {
    let whiteMoves: string[] = []
    let blackMoves: string[] = []

    /** i.e... 1. (e4) (e5) */
    const regEx = /\d*\. ([\S]*) ?([\S]*)/g

    let result
    while ((result = regEx.exec(this.pgn)) !== null) {
      const [, /* ignore match value when destructuring */ whiteMove, blackMove] = result
      if (this.isMove(whiteMove)) whiteMoves.push(this.cleanMove(whiteMove))
      if (this.isMove(blackMove)) blackMoves.push(this.cleanMove(blackMove))
    }
    const allMoves = []
    for (let i = 0; i < whiteMoves.length; i++) {
      const tempMoves = [whiteMoves[i]]
      if (blackMoves[i]) tempMoves.push(blackMoves[i])
      allMoves.push(...tempMoves)
    }
    return allMoves
  }

  get(): PGNData {
    return {
      pgn: this.pgn,
      moves: this.moves
    }
  }

  print() {
    console.log(this.pgn)
    console.log(this.moves.length)
  }

  isMove(value: string) {
    return !(value === '1-0' || value === '0-1' || value === '1/2-1/2')
  }

  cleanMove(move: string) {
    return move.replace(/#|\+/g, '')
  }
}
