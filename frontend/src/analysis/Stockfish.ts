import parseUCIStringToObject from './parseUCIStringToObject'

export interface Analysis {
  depth?: number
  bestMove: string
  score?: number
}

//depth 15 seldepth 20 multipv 1 score cp 103 nodes 383038 nps 870540 time 440 pv e2e4 e7e6 c2c4 c7c5 g1f3 d8c7 d2d4 c5d4 f3d4 g8f6 b1c3 b8c6 bmc 0.16214
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
}

// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1

// todo: currently, messages from old positions are still sent and registered for a bit after the position has changed
export default class Stockfish {
  worker: Worker
  counter = 0
  interval: NodeJS.Timeout
  isReady = false
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  depth = 5

  constructor(
    public onAnalysis: (sf: Stockfish, bestMove: string, depth: number) => void,
    onReady: () => void,
    public onEvaluation: (cp: number) => void
  ) {
    this.worker = new Worker('stockfish.js')
    this.worker.postMessage('isready')
    this.worker.onmessage = event => {
      const { data } = event
      if (!data) {
        console.error('data is null')
        return
      }
      const msg = data as string
      if (msg.startsWith('info')) {
        const hasBound = msg.includes('bound')
        const { depth, cp } = parseUCIStringToObject(msg.substring('info '.length), 18 + (hasBound ? 1 : 0)) as InfoObject
        if (this.depth === depth) {
          this.onEvaluation(cp)
        }
      } else if (msg.startsWith('bestmove')) {
        console.log(msg)
        const bestMove = msg.substring('bestmove '.length).substr(0, 4)
        this.onAnalysis(this, bestMove, this.depth)
        // this.stop()
      } else if (msg.startsWith('readyok')) {
        this.isReady = true
        onReady()
      }
    }
  }

  createNewGame(): void {
    this.worker.postMessage('ucinewgame')
  }

  analyzePosition(moves: string, depth: number): void {
    // Depth > 22 takes too long to finish, so moves aren't analyzed immediately. Lichess also caps at 22
    if (depth > 22) {
      return
    }
    if (!this.isReady) {
      console.log('not ready')
      return
    }
    this.counter++
    this.depth = depth
    console.log(`analyzing ${moves} at depth ${depth}`)
    // this.worker.postMessage('eval')
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
}
