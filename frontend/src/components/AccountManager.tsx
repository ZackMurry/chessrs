import { useToast } from '@chakra-ui/react'
import { FC, useCallback, useEffect } from 'react'
import { gql, request } from 'graphql-request'
import { setAccount } from 'store/userSlice'
import { TOAST_DURATION } from 'theme'
import { useAppDispatch } from 'utils/hooks'
import ErrorToast from './ErrorToast'

const AccountManager: FC = () => {
  const dispatch = useAppDispatch()
  const toast = useToast()

  const getUserData = useCallback(async () => {
    try {
      const query = gql`
        query GetUserAccount {
          account {
            id
            username
            name
          }
        }
      `
      const data = await request('/api/v1/graphql', query)
      if (!data.account) {
        console.log(data)
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => (
            <ErrorToast
              description={`Error getting account data from server: ${data.errors[0].message}`}
              onClose={options.onClose}
            />
          )
        })
        return
      }
      dispatch(setAccount(data.account))
    } catch (e: any) {
      if (e.response) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => (
            <ErrorToast
              description={`Error getting account data from server: ${e.response.errors[0].message}`}
              onClose={options.onClose}
            />
          )
        })
      } else {
        // Sign in with lichess
        window.location.href = '/api/v1/oauth2/code/lichess'
      }
    }
  }, [dispatch, toast])

  useEffect(() => {
    getUserData()
  }, [getUserData])

  return <></>
}

export default AccountManager
