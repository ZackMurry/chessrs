import { useToast } from '@chakra-ui/react'
import { FC, useCallback, useEffect } from 'react'
import { gql, request } from 'graphql-request'
import { setAccount } from 'store/userSlice'
import { TOAST_DURATION } from 'theme'
import { useAppDispatch } from 'utils/hooks'
import ErrorToast from './ErrorToast'
import { useLocation } from 'react-router-dom'
import { UserData } from 'types'

const AccountManager: FC = () => {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const location = useLocation()
  const checkAccount = location.pathname !== '/'

  const getUserData = useCallback(async () => {
    try {
      const query = gql`
        query GetUserAccount {
          account {
            id
            username
            name
            easeFactor
            scalingFactor
            authorities {
              authority
            }
          }
        }
      `
      const data = (await request('/api/v1/graphql', query)) as any
      if (!data.account) {
        console.log(data)
        window.location.href = '/api/v1/oauth2/code/lichess'
        return
      }
      const act = data.account as UserData
      dispatch(
        setAccount({
          ...act,
          isDemo: act.authorities.some(authority => authority.authority === 'ROLE_DEMO')
        })
      )
    } catch (e: any) {
      console.error(e)
      if (e?.response?.errors) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => (
            <ErrorToast
              description={`Error getting account data from server: ${
                e.response.errors ? e.response.errors[0].message : 'unknown'
              }`}
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
    if (checkAccount) {
      getUserData()
    }
  }, [getUserData, checkAccount])

  return <></>
}

export default AccountManager
