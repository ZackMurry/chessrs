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

export default class Stockfish {
  worker: Worker
  counter = 0
  interval: NodeJS.Timeout
  isReady = false
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

  constructor(public onAnalysis: (analysis: Analysis) => void, onReady: () => void) {
    this.worker = new Worker('stockfish.js')
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
        const { depth, cp, pv } = parseUCIStringToObject(
          msg.substring('info '.length),
          18 + (hasBound ? 1 : 0)
        ) as InfoObject
        this.onAnalysis({
          depth,
          bestMove: pv,
          score: cp
        })
      } else if (msg.startsWith('bestmove')) {
        const bestMove = msg.substring('bestmove '.length)
        this.onAnalysis({
          bestMove
        })
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

  analyzePosition(moves: string[]): void {
    if (!this.isReady) {
      console.log('not ready')
      return
    }
    this.counter++
    console.log(`analyzing ${moves.join(' ')}`)
    // this.worker.postMessage('eval')
    this.worker.postMessage(`position startpos moves ${moves.join(' ')}`)
    this.worker.postMessage(`go infinite`)
  }

  stop(): void {
    this.worker.postMessage('stop')
    this.counter--
    // clearInterval(this.interval)
  }

  quit(): void {
    this.worker.postMessage('quit')
  }
}
