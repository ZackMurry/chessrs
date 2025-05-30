import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import ChessJS, { PieceType } from 'chess.js'
import appendMoveToPgn from 'utils/appendMoveToPgn'
import getFirstMovesOfPgn from 'utils/getFirstMovesOfPgn'

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

interface PositionAnalysis {
  bestMove: Move
  eval: number
  mate: number
  depth: number
  engine: 'BROWSER' | 'LICHESS' | 'CHESSRS'
  fen: string
}

interface AnalysisLoading {
  local: boolean
  cloud: boolean
}

interface BoardState {
  fen: string
  pgn: string
  halfMoveCount: number
  history: string[]
  moveHistory: Move[]
  selectedPiece: SelectedPiece | null
  opening?: Opening
  games: {
    lichess: LichessGames
  }
  perspective: 'white' | 'black'
  enabled: boolean
  cloudAnalysis: PositionAnalysis | null
  localAnalysis: PositionAnalysis | null
  loadingAnalysis: AnalysisLoading
}

interface PositionLoad {
  fen: string
  perspective: 'white' | 'black'
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const initialState = {
  fen: STARTING_FEN,
  pgn: '',
  halfMoveCount: 0,
  history: [STARTING_FEN], // History of FENs
  selectedPiece: null,
  moveHistory: [],
  // todo: games should probably be stored in a different slice
  games: {
    lichess: {
      white: 3309965389,
      draws: 261081391,
      black: 3079018680,
      moves: [],
    },
  },
  perspective: 'white',
  enabled: true,
  // todo: analysis should be in another slice
  // todo: maybe store analysis history like moveHistory (Map from FEN to analysis?)
  cloudAnalysis: null,
  localAnalysis: null,
  loadingAnalysis: {
    cloud: false,
    local: true,
  },
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
        console.warn('overwriting')
        newHistory = newHistory.slice(0, state.halfMoveCount + 1)
        newMoveHistory = newMoveHistory.slice(0, state.halfMoveCount)
      }
      newMoveHistory.push({ san: move.san, uci: action.payload })
      console.log('new: ', newMoveHistory)
      const newPgn = newMoveHistory
        .reduce((acc, move, index) => {
          if (index % 2 === 0) {
            // White's move: start a new turn
            const moveNumber = Math.floor(index / 2) + 1
            acc.push(`${moveNumber}. ${move.san}`)
          } else {
            // Black's move: append to last turn
            acc[acc.length - 1] += ` ${move.san}`
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
        moveHistory: newMoveHistory,
      }
    },
    selectPiece: (state, action: PayloadAction<SelectedPiece>) => {
      return {
        ...state,
        selectedPiece: action.payload,
      }
    },
    unselectPiece: (state) => ({
      ...state,
      selectedPiece: null,
    }),
    traverseBackwards: (state) => {
      if (state.halfMoveCount === 0) {
        return state
      }
      return {
        ...state,
        halfMoveCount: state.halfMoveCount - 1,
        fen: state.history[state.halfMoveCount - 1],
      }
    },
    traverseForwards: (state) => {
      if (state.halfMoveCount >= state.moveHistory.length) {
        return state
      }
      return {
        ...state,
        halfMoveCount: state.halfMoveCount + 1,
        fen: state.history[state.halfMoveCount + 1],
      }
    },
    traverseToStart: (state) => ({
      ...state,
      fen: state.history[0],
      halfMoveCount: 0,
    }),
    traverseToEnd: (state) => {
      if (state.halfMoveCount >= state.moveHistory.length) {
        return state
      }
      return {
        ...state,
        halfMoveCount: state.moveHistory.length,
        fen: state.history[state.history.length - 1],
      }
    },
    traverseToMove: (state, action: PayloadAction<number>) => {
      if (action.payload >= state.moveHistory.length || action.payload < 0) {
        return state
      }
      return {
        ...state,
        halfMoveCount: action.payload + 1,
        fen: state.history[action.payload + 1],
      }
    },
    updateLichessGames: (state, action: PayloadAction<LichessGames>) => {
      return {
        ...state,
        games: {
          ...state.games,
          lichess: action.payload,
        },
      }
    },
    updateOpening: (state, action: PayloadAction<Opening>) => {
      if (!action.payload) {
        return state
      }
      return {
        ...state,
        opening: action.payload,
      }
    },
    flipBoard: (state) => {
      return {
        ...state,
        perspective: state.perspective === 'white' ? 'black' : 'white',
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
            moves: [],
          },
        },
        history: [action.payload.fen],
        moveHistory: [],
        pgn: '',
        opening: undefined,
        halfMoveCount: 0,
        selectedPiece: null,
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
        perspective: action.payload.perspective,
        fen: action.payload.fen,
        history: [action.payload.fen],
        moveHistory: [],
        pgn: '',
        opening: undefined,
        selectedPiece: null,
      }
    },
    wrongMoveReset: (state) => {
      return {
        ...state,
        enabled: true,
        halfMoveCount: 0,
      }
    },
    resetHalfMoveCount: (state) => {
      return {
        ...state,
        halfMoveCount: 0,
      }
    },
    disableBoard: (state) => {
      return {
        ...state,
        enabled: false,
      }
    },
    clearMetaData: (state) => {
      return {
        ...initialState,
        fen: state.fen,
        perspective: state.perspective,
      }
    },
    clearLichessGames: (state) => {
      return {
        ...state,
        games: {
          lichess: initialState.games.lichess,
        },
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
        pgn: game.pgn(),
      }
    },
    updateLocalAnalysis: (state, action: PayloadAction<PositionAnalysis>) => {
      return {
        ...state,
        localAnalysis: action.payload,
      }
    },
    updateLocalBestMove: (state, action: PayloadAction<Move>) => {
      return {
        ...state,
        localAnalysis: {
          ...state.localAnalysis,
          bestMove: action.payload,
        },
      }
    },
    clearLocalAnalysis: (state) => ({
      ...state,
      localAnalysis: null,
    }),
    updateCloudAnalysis: (state, action: PayloadAction<PositionAnalysis>) => {
      return {
        ...state,
        cloudAnalysis: action.payload,
      }
    },
    clearCloudAnalysis: (state) => ({
      ...state,
      cloudAnalysis: null,
    }),
    setLocalAnalysisLoading: (state, action: PayloadAction<boolean>) => ({
      ...state,
      loadingAnalysis: {
        ...state.loadingAnalysis,
        local: action.payload,
      },
    }),
    setCloudAnalysisLoading: (state, action: PayloadAction<boolean>) => ({
      ...state,
      loadingAnalysis: {
        ...state.loadingAnalysis,
        cloud: action.payload,
      },
    }),
  },
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
  resetBoard,
  wrongMove,
  wrongMoveReset,
  resetHalfMoveCount,
  disableBoard,
  clearMetaData,
  clearLichessGames,
  updateLocalAnalysis,
  updateLocalBestMove,
  clearLocalAnalysis,
  updateCloudAnalysis,
  clearCloudAnalysis,
  setLocalAnalysisLoading,
  setCloudAnalysisLoading,
} = boardSlice.actions

export default boardSlice.reducer
