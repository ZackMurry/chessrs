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

export const SF_DEPTH = 25

export default class Stockfish {
  worker: Worker
  counter = 0
  interval: NodeJS.Timeout
  public isReady = false
  depth = SF_DEPTH
  lastDepth = 0
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
  started = false

  constructor(
    public onAnalysis: (bestMove: string, sfFen) => void,
    public onReady: () => void,
    public onEvaluation: (cp: number, mate: number, bestMove: string, depth: number, sfFen: string) => void
  ) {
    console.warn('running stockfish')
    this.worker = new Worker('/stockfish.js')
    this.worker.postMessage('isready')
    this.worker.onmessage = event => {
      const { data } = event
      if (!data) {
        console.error('data is null')
        return
      }
      const msg = data as string
      console.log(msg)
      if (msg.startsWith('info')) {
        const hasBound = msg.includes('bound')
        if (hasBound) return
        const { depth, cp, mate, pv } = parseUCIStringToObject(
          msg.substring('info '.length),
          18 + (hasBound ? 1 : 0)
        ) as InfoObject
        if (this.onEvaluation && this.lastDepth + 1 === depth) {
          // console.warn(
          //   `calling onEvaluation(${cp}, ${mate}, ${pv}, ${depth}, ${this.fen})`,
          // )
          this.lastDepth = depth
          this.onEvaluation(cp, mate ?? null, pv, depth, this.fen)
        }
      } else if (msg.startsWith('bestmove')) {
        if (!this.onAnalysis) {
          console.warn('!onAnalysis')
          return
        }
        // console.log(msg)
        const bestMove = msg.substring('bestmove '.length).substr(0, 4)
        console.error('onAnalysis!')
        this.onAnalysis(bestMove, this.fen)
        // console.warn('creating new game')
        this.createNewGame()
        // console.warn('asking isready')
        this.worker.postMessage('isready')
        // this.isReady = true
        // this.stop()
      } else if (msg.startsWith('readyok')) {
        this.isReady = true
        if (!this.started) {
          this.createNewGame()
          this.started = true
        }
        if (this.onReady) {
          this.onReady()
          this.onReady = null
        }
      }
    }
  }

  createNewGame(): void {
    this.worker.postMessage('ucinewgame')
  }

  analyzePosition(moves: string, depth: number, fen: string, startpos: string | null): void {
    // Depth > 20 takes too long to finish, so moves aren't analyzed immediately. Lichess also caps at 22
    if (depth > SF_DEPTH) {
      return
    }
    if (!this.isReady && this.started) {
      // console.log('not ready')
      // console.error('Stopping!')
      this.stop()
      this.createNewGame()
      this.worker.postMessage('isready')
      return
    } else if (!this.isReady) {
      return
    }
    this.isReady = false
    this.onReady = null
    this.fen = fen
    // this.counter++
    // console.error('ANALYZING POSITION')
    this.lastDepth = 0
    this.depth = depth
    console.log(`analyzing ${moves} at depth ${depth} at startpos ${startpos}`)
    if (startpos) {
      this.worker.postMessage(`position fen ${startpos} moves ${moves}`)
    } else {
      this.worker.postMessage(`position startpos moves ${moves}`)
    }
    this.worker.postMessage(`go depth ${depth}`)
  }

  stop(): void {
    console.warn('Interrupting Stockfish!')
    this.worker.postMessage('stop')
    // this.counter--
  }

  quit(): void {
    this.worker.postMessage('quit')
  }

  terminate(): void {
    this.isReady = false
    this.worker.terminate()
  }
}
