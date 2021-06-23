import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import ChessJS, { PieceType } from 'chess.js'
import appendMoveToPgn from '../appendMoveToPgn'
import getFirstMovesOfPgn from '../getFirstMovesOfPgn'
import { PGN } from '../pgnParser'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

export interface SelectedPiece {
  position: string
  type: PieceType
}

interface BoardState {
  fen: string
  pgn: string
  halfMoveCount: number
  history: string[]
  selectedPiece: SelectedPiece | null
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const initialState = {
  fen: STARTING_FEN,
  pgn: '',
  halfMoveCount: 0,
  history: [STARTING_FEN], // History of FENs
  selectedPiece: null
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
      // If history is being overwritten
      if (state.history.length - 1 > state.halfMoveCount) {
        newHistory = newHistory.slice(0, state.halfMoveCount + 1)
        const subPgn = getFirstMovesOfPgn(state.pgn, state.halfMoveCount)
        newPgn = appendMoveToPgn(subPgn, move.san, state.halfMoveCount)
      } else {
        newPgn = appendMoveToPgn(state.pgn, move.san, state.halfMoveCount)
      }
      return {
        ...state,
        fen,
        pgn: newPgn,
        halfMoveCount: state.halfMoveCount + 1,
        history: [...newHistory, fen]
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
    }
  }
})

export const { makeMove, selectPiece, unselectPiece, traverseBackwards, traverseForwards } = boardSlice.actions

export default boardSlice.reducer
