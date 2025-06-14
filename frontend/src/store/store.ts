import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardSlice'
import userReducer from './userSlice'
import analysisReducer from './analysisSlice'

const store = configureStore({
  reducer: {
    board: boardReducer,
    user: userReducer,
    analysis: analysisReducer
  },
  devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
