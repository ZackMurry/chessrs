import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import ChessJS, { PieceType } from 'chess.js'
import appendMoveToPgn from '../appendMoveToPgn'
import getFirstMovesOfPgn from '../getFirstMovesOfPgn'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

export interface SelectedPiece {
  position: string
  type: PieceType
}

interface Opening {
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
  history: string[]
  moveHistory: Move[]
  selectedPiece: SelectedPiece | null
  opening?: Opening
  games: {
    lichess: LichessGames
  }
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const initialState = {
  fen: STARTING_FEN,
  pgn: '',
  halfMoveCount: 0,
  history: [STARTING_FEN], // History of FENs
  selectedPiece: null,
  moveHistory: [],
  games: {
    lichess: {
      // todo: probably want to have a caching system for at least some of the data
      white: 19598901,
      draws: 1843985,
      black: 18101922,
      moves: []
    }
  }
} as BoardState

export const boardSlice = createSlice({
  name: 'boardPosition',
  initialState,
  reducers: {
    makeMove: (state, action: PayloadAction<string>) => {
      const game = new Chess(state.fen)
      const move = game.move(action.payload, { sloppy: true })
      if (move === null) {
        // Move was illegal
        return state
      }
      const fen = game.fen()
      let newHistory = [...state.history]
      let newPgn: string
      let newMoveHistory = [...state.moveHistory]
      // If history is being overwritten
      console.log('HERE: ', state.halfMoveCount, state.history.length)
      if (state.history.length - 1 > state.halfMoveCount) {
        console.warn('overwriting')
        newHistory = newHistory.slice(0, state.halfMoveCount + 1)
        const subPgn = getFirstMovesOfPgn(state.pgn, state.halfMoveCount)
        newPgn = appendMoveToPgn(subPgn, move.san, state.halfMoveCount)
        newMoveHistory = newMoveHistory.slice(0, state.halfMoveCount)
      } else {
        newPgn = appendMoveToPgn(state.pgn, move.san, state.halfMoveCount)
      }
      newMoveHistory.push({ san: move.san, uci: action.payload })
      console.log('new: ', newMoveHistory)
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
      return {
        ...state,
        halfMoveCount: state.halfMoveCount - 1,
        fen: state.history[state.halfMoveCount - 1]
      }
    },
    traverseForwards: state => {
      return {
        ...state,
        halfMoveCount: state.halfMoveCount + 1,
        fen: state.history[state.halfMoveCount + 1]
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
    }
  }
})

export const {
  makeMove,
  selectPiece,
  unselectPiece,
  traverseBackwards,
  traverseForwards,
  updateLichessGames,
  updateOpening
} = boardSlice.actions

export default boardSlice.reducer
