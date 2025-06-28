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

export const SF_DEPTH = 22

export default class Stockfish {
  worker: Worker
  counter = 0
  interval: NodeJS.Timeout
  public isReady = false
  targetDepth = SF_DEPTH
  lastDepth = 0
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
  started = false
  running = false
  restarted = false
  public onAnalysis: (bestMove: string, sfFen) => void
  public onReady: () => void
  public onEvaluation: (cp: number, mate: number, bestMove: string, depth: number, sfFen: string) => void
  moves: string = ''
  startpos: string | null = null

  constructor() {
    // public onEvaluation: (cp: number, mate: number, bestMove: string, depth: number, sfFen: string) => void // public onReady: () => void, // public onAnalysis: (bestMove: string, sfFen) => void,
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
      if (this.running || true) {
        console.log(msg)
      }
      if (msg.startsWith('info')) {
        this.restarted = false
        if (!this.running) return
        const hasBound = msg.includes('bound')
        if (hasBound) return
        const { depth, cp, mate, pv } = parseUCIStringToObject(
          msg.substring('info '.length),
          18 + (hasBound ? 1 : 0)
        ) as InfoObject
        console.warn('lastDepth', this.lastDepth, 'depth', depth)
        if (this.onEvaluation && this.lastDepth + 1 === depth) {
          // console.warn(
          //   `calling onEvaluation(${cp}, ${mate}, ${pv}, ${depth}, ${this.fen})`,
          // )
          this.lastDepth = depth
          this.onEvaluation(cp, mate ?? null, pv, depth, this.fen)
        }
      } else if (msg.startsWith('bestmove')) {
        if (!this.running) return
        if (!this.onAnalysis) {
          console.warn('!onAnalysis')
          return
        }
        if (this.lastDepth < this.targetDepth) {
          if (this.restarted) return
          console.warn('GOING AGAIN')
          this.restarted = true
          this.lastDepth = 0
          this.stop()
          this.createNewGame()
          if (this.startpos) {
            this.worker.postMessage(`position fen ${this.startpos} moves ${this.moves}`)
          } else {
            this.worker.postMessage(`position startpos moves ${this.moves}`)
          }
          this.running = true
          this.worker.postMessage(`go depth 22`)
          return
        }
        // console.log(msg)
        const bestMove = msg.substring('bestmove '.length).substring(0, 4)
        console.error('onAnalysis!')
        this.onAnalysis(bestMove, this.fen)
        this.stop()
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
    console.warn('DEPTH', depth)
    if (depth > SF_DEPTH) {
      return
    }
    if (!this.isReady && this.started) {
      // console.log('not ready')
      console.error('Stopping!')
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
    this.restarted = false
    this.targetDepth = depth
    this.startpos = startpos
    this.moves = moves
    console.log(`analyzing ${moves} at depth ${depth} at startpos ${startpos}`)
    if (startpos) {
      this.worker.postMessage(`position fen ${startpos} moves ${moves}`)
    } else {
      this.worker.postMessage(`position startpos moves ${moves}`)
    }
    console.warn('starting stockfish!!!')
    this.running = true
    this.worker.postMessage(`go depth ${depth}`)
  }

  stop(): void {
    console.warn('Interrupting Stockfish!', this.isReady, this.started)
    this.worker.postMessage('stop')
    this.running = false
    // this.counter--
  }

  quit(): void {
    console.error('QUITTING')
    this.worker.postMessage('quit')
  }

  terminate(): void {
    this.isReady = false
    this.worker.terminate()
  }
}
