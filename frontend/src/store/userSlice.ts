import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserData } from 'types'

interface UserState {
  account: UserData | null
}

const initialState = { account: null } as UserState

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<UserData>) => {
      return {
        ...state,
        account: action.payload
      }
    }
  }
})

export const { setAccount } = userSlice.actions

export default userSlice.reducer
