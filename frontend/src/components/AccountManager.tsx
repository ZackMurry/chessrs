import { FC, useCallback, useEffect } from 'react'
import { setAccount } from 'store/userSlice'
import { useAppDispatch } from 'utils/hooks'

const AccountManager: FC = () => {
  const dispatch = useAppDispatch()
  const getUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/users/account')
      if (!response.ok) {
        console.error('Error getting user data')
        return
      }
      const json = await response.json()
      dispatch(setAccount(json))
    } catch (e: any) {
      // Sign in with lichess
      window.location.href = '/api/v1/oauth2/code/lichess'
    }
  }, [dispatch])

  useEffect(() => {
    console.warn('getting user data')
    getUserData()
  }, [getUserData])

  return <></>
}

export default AccountManager
