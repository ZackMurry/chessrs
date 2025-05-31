import parseUCIStringToObject from './parseUCIStringToObject'

export interface Analysis {
  depth?: number
  bestMove: string
  score?: number
}

export interface InfoObject {
  depth: number
  seldepth: number
  multipv: number
  cp: number
  nodes: number
  nps: number
  time: number
  pv: string
  bmc: number
  mate?: number
}

export default class Stockfish {
  worker: Worker
  counter = 0
  interval: NodeJS.Timeout
  public isReady = false
  depth = 22
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

  constructor(
    public onAnalysis: (
      sf: Stockfish,
      bestMove: string,
      depth: number,
      sfFen,
    ) => void,
    public onReady: () => void,
    public onEvaluation: (
      cp: number,
      mate: number,
      bestMove: string,
      depth: number,
      sfFen: string,
    ) => void,
  ) {
    console.warn('running stockfish')
    this.worker = new Worker('/stockfish.js')
    this.worker.postMessage('isready')
    this.worker.onmessage = (event) => {
      const { data } = event
      if (!data) {
        console.error('data is null')
        return
      }
      const msg = data as string
      console.log(msg)
      if (msg.startsWith('info')) {
        const hasBound = msg.includes('bound')
        const { depth, cp, mate, pv } = parseUCIStringToObject(
          msg.substring('info '.length),
          18 + (hasBound ? 1 : 0),
        ) as InfoObject
        if (this.onEvaluation) {
          console.warn(
            `calling onEvaluation(${cp}, ${mate}, ${pv}, ${depth}, ${this.fen})`,
          )
          this.onEvaluation(cp, mate, pv, depth, this.fen)
        }
      } else if (msg.startsWith('bestmove')) {
        if (!this.onAnalysis) {
          console.warn('!onAnalysis')
          return
        }
        console.log(msg)
        const bestMove = msg.substring('bestmove '.length).substr(0, 4)
        this.onAnalysis(this, bestMove, this.depth, this.fen)
        this.isReady = true
        // this.stop()
      } else if (msg.startsWith('readyok')) {
        this.isReady = true
        if (this.onReady) {
          this.onReady()
        }
      }
    }
  }

  createNewGame(): void {
    this.worker.postMessage('ucinewgame')
  }

  analyzePosition(moves: string, depth: number, fen: string): void {
    // Depth > 22 takes too long to finish, so moves aren't analyzed immediately. Lichess also caps at 22
    if (depth > 22) {
      return
    }
    if (!this.isReady) {
      console.log('not ready')
      return
    }
    this.fen = fen
    this.counter++
    this.depth = depth
    console.log(`analyzing ${moves} at depth ${depth}`)
    this.worker.postMessage(`position startpos moves ${moves}`)
    this.worker.postMessage(`go depth ${depth}`)
  }

  stop(): void {
    this.worker.postMessage('stop')
    this.counter--
  }

  quit(): void {
    this.worker.postMessage('quit')
  }

  terminate(): void {
    this.isReady = false
    this.worker.terminate()
  }
}
