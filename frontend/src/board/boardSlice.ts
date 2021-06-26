import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import ChessJS, { PieceType } from 'chess.js'
import appendMoveToPgn from '../appendMoveToPgn'
import getFirstMovesOfPgn from '../getFirstMovesOfPgn'

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
  moveHistory: string[]
  selectedPiece: SelectedPiece | null
}

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const initialState = {
  fen: STARTING_FEN,
  pgn: '',
  halfMoveCount: 0,
  history: [STARTING_FEN], // History of FENs
  selectedPiece: null,
  moveHistory: []
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
      if (state.history.length - 1 > state.halfMoveCount) {
        newHistory = newHistory.slice(0, state.halfMoveCount + 1)
        const subPgn = getFirstMovesOfPgn(state.pgn, state.halfMoveCount)
        newPgn = appendMoveToPgn(subPgn, move.san, state.halfMoveCount)
        newMoveHistory = newMoveHistory.slice(0, state.halfMoveCount + 1)
      } else {
        newPgn = appendMoveToPgn(state.pgn, move.san, state.halfMoveCount)
        newMoveHistory.push(action.payload)
      }
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
    }
  }
})

export const { makeMove, selectPiece, unselectPiece, traverseBackwards, traverseForwards } = boardSlice.actions

export default boardSlice.reducer
