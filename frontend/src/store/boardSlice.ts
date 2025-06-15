import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import ChessJS, { PieceType } from 'chess.js'
import getPlyIndexFromFEN from 'utils/getPlyIndexFromFEN'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

export interface SelectedPiece {
  position: string
  type: PieceType
}

export interface Opening {
  eco: string
  name: string
}

interface LichessAPIMove {
  uci: string
  san: string
  white: number
  draws: number
  black: number
  averageRating: number
}

interface LichessGames {
  white: number
  draws: number
  black: number
  moves: LichessAPIMove[]
}

interface Move {
  uci: string
  san: string
}

interface BoardState {
  fen: string
  pgn: string
  halfMoveCount: number
  startHalfMoveCount: number
  history: string[]
  moveHistory: Move[]
  selectedPiece: SelectedPiece | null
  opening?: Opening
  games: {
    lichess: LichessGames
  }
  perspective: 'white' | 'black'
  enabled: boolean
  isStudy: boolean
}

interface PositionLoad {
  fen: string
  perspective: 'white' | 'black'
}

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const initialState = {
  fen: STARTING_FEN,
  pgn: '',
  halfMoveCount: 0,
  startHalfMoveCount: 0,
  history: [STARTING_FEN], // History of FENs
  selectedPiece: null,
  moveHistory: [],
  // todo: games should probably be stored in a different slice
  games: {
    lichess: {
      white: 3309965389,
      draws: 261081391,
      black: 3079018680,
      moves: []
    }
  },
  perspective: 'white',
  enabled: true,
  isStudy: false
} as BoardState

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    makeMove: (state, action: PayloadAction<string>) => {
      const game = new Chess(state.fen)
      const move = game.move(action.payload, { sloppy: true })
      if (move === null) {
        console.warn('illegal move: ', action.payload)
        // Move was illegal
        return state
      }
      const fen = game.fen()
      let newHistory = [...state.history]
      let newMoveHistory = [...state.moveHistory]
      // If history is being overwritten
      console.log('HERE: ', state.halfMoveCount, state.history.length)
      if (state.history.length - 1 > state.halfMoveCount) {
        newHistory = newHistory.slice(0, state.halfMoveCount + 1)
        newMoveHistory = newMoveHistory.slice(0, state.halfMoveCount)
      }
      newMoveHistory.push({ san: move.san, uci: action.payload })
      console.log('new: ', newMoveHistory)
      let pgnMoves = newMoveHistory.map(m => m.san)
      if (state.startHalfMoveCount % 2 === 0) {
        pgnMoves = ['...', ...pgnMoves]
      }
      const newPgn = pgnMoves
        .reduce((acc, move, index) => {
          if (index % 2 === 0) {
            // White's move: start a new turn
            const moveNumber = Math.floor(index / 2) + 1
            acc.push(`${moveNumber}. ${move}`)
          } else {
            // Black's move: append to last turn
            acc[acc.length - 1] += ` ${move}`
          }
          return acc
        }, [])
        .join(' ')
      return {
        ...state,
        fen,
        pgn: newPgn,
        halfMoveCount: state.halfMoveCount + 1,
        history: [...newHistory, fen],
        moveHistory: newMoveHistory
      }
    },
    selectPiece: (state, action: PayloadAction<SelectedPiece>) => {
      return {
        ...state,
        selectedPiece: action.payload
      }
    },
    unselectPiece: state => ({
      ...state,
      selectedPiece: null
    }),
    traverseBackwards: state => {
      if (state.halfMoveCount === 0) {
        return state
      }
      return {
        ...state,
        halfMoveCount: state.halfMoveCount - 1,
        fen: state.history[state.halfMoveCount - 1]
      }
    },
    traverseForwards: state => {
      if (state.halfMoveCount >= state.moveHistory.length) {
        return state
      }
      return {
        ...state,
        halfMoveCount: state.halfMoveCount + 1,
        fen: state.history[state.halfMoveCount + 1]
      }
    },
    traverseToStart: state => ({
      ...state,
      fen: state.history[0],
      halfMoveCount: 0
    }),
    traverseToEnd: state => {
      if (state.halfMoveCount >= state.moveHistory.length) {
        return state
      }
      return {
        ...state,
        halfMoveCount: state.moveHistory.length,
        fen: state.history[state.history.length - 1]
      }
    },
    traverseToMove: (state, action: PayloadAction<number>) => {
      if (action.payload >= state.moveHistory.length || action.payload < 0) {
        return state
      }
      return {
        ...state,
        halfMoveCount: action.payload + 1,
        fen: state.history[action.payload + 1]
      }
    },
    updateLichessGames: (state, action: PayloadAction<LichessGames>) => {
      return {
        ...state,
        games: {
          ...state.games,
          lichess: action.payload
        }
      }
    },
    updateOpening: (state, action: PayloadAction<Opening>) => {
      if (!action.payload) {
        return state
      }
      return {
        ...state,
        opening: action.payload
      }
    },
    flipBoard: state => {
      return {
        ...state,
        perspective: state.perspective === 'white' ? 'black' : 'white'
      }
    },
    loadPosition: (state, action: PayloadAction<PositionLoad>) => {
      return {
        ...state,
        perspective: action.payload.perspective,
        fen: action.payload.fen,
        games: {
          lichess: {
            white: 0,
            black: 0,
            draws: 0,
            moves: []
          }
        },
        history: [action.payload.fen],
        moveHistory: [],
        pgn: '',
        opening: undefined,
        halfMoveCount: 0,
        startHalfMoveCount: 0,
        selectedPiece: null
      }
    },
    resetBoard: () => {
      return initialState
    },
    wrongMove: (state, action: PayloadAction<PositionLoad>) => {
      return {
        ...state,
        enabled: false,
        halfMoveCount: 0,
        startHalfMoveCount: 0,
        perspective: action.payload.perspective,
        fen: action.payload.fen,
        history: [action.payload.fen],
        moveHistory: [],
        pgn: '',
        opening: undefined,
        selectedPiece: null
      }
    },
    wrongMoveReset: state => {
      return {
        ...state,
        enabled: true,
        halfMoveCount: 0
      }
    },
    resetHalfMoveCount: state => {
      return {
        ...state,
        halfMoveCount: 0
      }
    },
    disableBoard: state => {
      return {
        ...state,
        enabled: false
      }
    },
    clearMetaData: state => {
      return {
        ...initialState,
        fen: state.fen,
        perspective: state.perspective
      }
    },
    clearLichessGames: state => {
      return {
        ...state,
        games: {
          lichess: initialState.games.lichess
        }
      }
    },
    loadMoves: (state, action: PayloadAction<string>) => {
      const game = new Chess()
      const history: string[] = [game.fen()]
      const moves = action.payload.split(' ')
      const moveHistory: Move[] = []
      for (const move of moves) {
        const m = game.move(move, { sloppy: true })
        if (m === null) {
          console.warn('Invalid move')
          break
        }
        const { san, from, to, promotion } = m
        moveHistory.push({ san: san, uci: `${from}${to}${promotion ?? ''}` })
        history.push(game.fen())
      }
      return {
        ...state,
        perspective: 'white',
        fen: history[0],
        history,
        moveHistory,
        pgn: game.pgn()
      }
    },
    loadStudyChapter: (state, action: PayloadAction<string>) => {
      const extractFen = (pgnStr: string) => {
        const match = pgnStr.match(/\[FEN\s+"([^"]+)"\]/)
        return match ? match[1] : null
      }
      const parsedGame = new Chess()
      const startFen = extractFen(action.payload.trim())
      const startCount = startFen ? getPlyIndexFromFEN(startFen) : 0
      const success = parsedGame.load_pgn(action.payload.trim())
      if (!success) {
        console.error('Failed to load chapter', action.payload)
        return state
      }
      const moveHistory: Move[] = []
      const game = new Chess()
      if (startFen) {
        console.log('loading fen', startFen)
        game.load(startFen)
      }
      const history: string[] = [game.fen()]
      const moves = parsedGame.history()
      for (const move of moves) {
        const m = game.move(move, { sloppy: true })

        if (m === null) {
          console.warn('Invalid move')
          break
        }
        const { san, from, to, promotion } = m
        moveHistory.push({ san: san, uci: `${from}${to}${promotion ?? ''}` })
        history.push(game.fen())
      }
      return {
        ...state,
        perspective: 'white',
        fen: history[0],
        history,
        moveHistory,
        pgn: game.pgn(),
        halfMoveCount: 0,
        startHalfMoveCount: startCount,
        isStudy: true
      }
    }
  }
})

export const {
  makeMove,
  selectPiece,
  unselectPiece,
  traverseBackwards,
  traverseForwards,
  traverseToStart,
  traverseToEnd,
  traverseToMove,
  updateLichessGames,
  updateOpening,
  flipBoard,
  loadMoves,
  loadPosition,
  loadStudyChapter,
  resetBoard,
  wrongMove,
  wrongMoveReset,
  resetHalfMoveCount,
  disableBoard,
  clearMetaData,
  clearLichessGames
} = boardSlice.actions

export default boardSlice.reducer
