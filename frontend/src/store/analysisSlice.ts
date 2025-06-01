import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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

interface AnalysisState {
  cloudAnalysis: PositionAnalysis | null
  localAnalysis: PositionAnalysis | null
  cloudLoading: boolean
  localLoading: boolean
}

const initialState = {
  // todo: maybe store analysis history like moveHistory (Map from FEN to analysis?)
  cloudAnalysis: null,
  localAnalysis: null,
  cloudLoading: false,
  localLoading: true,
} as AnalysisState

export const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
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
      localLoading: action.payload,
    }),
    setCloudAnalysisLoading: (state, action: PayloadAction<boolean>) => ({
      ...state,
      cloudLoading: action.payload,
    }),
  },
})

export const {
  updateLocalAnalysis,
  updateLocalBestMove,
  clearLocalAnalysis,
  updateCloudAnalysis,
  clearCloudAnalysis,
  setLocalAnalysisLoading,
  setCloudAnalysisLoading,
} = analysisSlice.actions

export default analysisSlice.reducer
