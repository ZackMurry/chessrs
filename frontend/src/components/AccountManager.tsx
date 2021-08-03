import { useToast } from '@chakra-ui/react'
import { FC, useCallback, useEffect } from 'react'
import { setAccount } from 'store/userSlice'
import { TOAST_DURATION } from 'theme'
import { useAppDispatch } from 'utils/hooks'
import ErrorToast from './ErrorToast'

const AccountManager: FC = () => {
  const dispatch = useAppDispatch()
  const toast = useToast()

  const getUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/users/account')
      if (!response.ok) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => (
            <ErrorToast
              description={`Error getting account data from server (status: ${response.status})`}
              onClose={options.onClose}
            />
          )
        })
        return
      }
      const json = await response.json()
      dispatch(setAccount(json))
    } catch (e: any) {
      // Sign in with lichess
      window.location.href = '/api/v1/oauth2/code/lichess'
    }
  }, [dispatch, toast])

  useEffect(() => {
    getUserData()
  }, [getUserData])

  return <></>
}

export default AccountManager
