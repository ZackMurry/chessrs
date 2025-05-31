import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardSlice'
import userReducer from './userSlice'

const store = configureStore({
  reducer: {
    board: boardReducer,
    user: userReducer,
  },
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
