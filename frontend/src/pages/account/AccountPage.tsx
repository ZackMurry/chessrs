import { Box, useBoolean, useToast } from '@chakra-ui/react'
import ErrorToast from 'components/ErrorToast'
import { FC, FormEvent, useState } from 'react'
import { request, gql } from 'graphql-request'
import { Button, TextField } from '@radix-ui/themes'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import { setAccount } from 'store/userSlice'
import { TOAST_DURATION } from 'theme'
import { useEffect } from 'react'
import ConfirmationDialog from 'components/ConfirmationDialog'
import SuccessToast from 'components/SuccessToast'
import { BrainCog, Dumbbell } from 'lucide-react'

const DEFAULT_EASE_FACTOR = 3
const DEFAULT_SCALING_FACTOR = 2

// todo: log out
const AccountPage: FC = () => {
  const account = useAppSelector((state) => state.user?.account)
  const [easeFactor, setEaseFactor] = useState(
    String(account?.easeFactor ?? DEFAULT_EASE_FACTOR),
  )
  const [scalingFactor, setScalingFactor] = useState(
    String(account?.scalingFactor ?? DEFAULT_SCALING_FACTOR),
  )
  const [isLoading, setLoading] = useState(false)
  const [
    isDeleteAccountDialogOpen,
    { on: openDeleteAccountDialog, off: closeDeleteAccountDialog },
  ] = useBoolean(false)
  const dispatch = useAppDispatch()
  const toast = useToast()

  useEffect(() => {
    setEaseFactor(String(account?.easeFactor ?? DEFAULT_EASE_FACTOR))
  }, [account?.easeFactor, setEaseFactor])

  useEffect(() => {
    setScalingFactor(String(account?.scalingFactor ?? DEFAULT_SCALING_FACTOR))
  }, [account?.scalingFactor, setScalingFactor])

  if (account === null) {
    return <Box />
  }

  const onSubmitEaseFactor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const query = gql`
        mutation UpdateEaseFactor($easeFactor: Float!) {
          updateSettings(easeFactor: $easeFactor) {
            id
            username
            name
            easeFactor
            scalingFactor
          }
        }
      `
      const data = (await request('/api/v1/graphql', query, {
        easeFactor,
      })) as any
      dispatch(setAccount(data.updateSettings))
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: (options) => (
          <ErrorToast
            description={`Error updating ease factor: ${e.response?.errors[0]?.message}`}
            onClose={options.onClose}
          />
        ),
      })
    }
    setLoading(false)
  }

  const onSubmitScalingFactor = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const query = gql`
        mutation UpdateScalingFactor($scalingFactor: Float!) {
          updateSettings(scalingFactor: $scalingFactor) {
            id
            username
            name
            easeFactor
            scalingFactor
          }
        }
      `
      const data = (await request('/api/v1/graphql', query, {
        scalingFactor,
      })) as any
      dispatch(setAccount(data.updateSettings))
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: (options) => (
          <ErrorToast
            description={`Error updating scalingFactor: ${e.response?.errors[0]?.message}`}
            onClose={options.onClose}
          />
        ),
      })
    }
    setLoading(false)
  }

  const onDeleteAccount = async () => {
    setLoading(true)
    try {
      const query = gql`
        mutation DeleteAccount {
          deleteAccount {
            username
          }
        }
      `
      await request('/api/v1/graphql', query)
      dispatch(setAccount(null))
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: (options) => (
          <SuccessToast
            description='Account deleted'
            onClose={options.onClose}
          />
        ),
      })
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: (options) => (
          <ErrorToast
            description={`Error deleting account: ${e.response?.errors[0]?.message}`}
            onClose={options.onClose}
          />
        ),
      })
    }
    setLoading(false)
  }

  return (
    <Box
      borderColor='surfaceBorder'
      borderStyle='solid'
      borderWidth='2px'
      borderRadius='3px'
      p={{ base: '15px', md: '25px', xl: '50px' }}
      bg='surface'
      m='40px auto'
      w={{ base: '100%', md: '75%' }}
    >
      <h1 className='text-offwhite text-3xl font-bold mb-4'>
        Account Settings: {account.name}
      </h1>
      <form onSubmit={onSubmitEaseFactor} className='my-8'>
        <div>
          <h3 className='text-offwhite text-xl font-semibold'>Ease Factor</h3>
          <p className='text-offwhite text-md mb-2'>
            Your ease factor controls how often moves need to be reviewed. The
            higher your ease factor, the fewer times you will need to review
            every move.
            <br />
            Specifically, your ease factor is the time between the first review
            and the second review, in minutes.
          </p>
          <TextField.Root
            placeholder='Ease factor...'
            type='number'
            className='max-w-[300px]'
            value={easeFactor}
            onChange={(e) => setEaseFactor(e.target.value)}
          >
            <TextField.Slot>
              <BrainCog height='16' width='16' />
            </TextField.Slot>
          </TextField.Root>
        </div>
        <div className='my-5'>
          <h3 className='text-offwhite text-xl font-semibold'>
            Scaling Factor
          </h3>
          <p className='text-offwhite text-md mb-2'>
            Your scaling factor controls how fast the interval between reviews
            grows. For example, with a scaling factor of 2, the time between
            reviews will double after each review.
          </p>
          <TextField.Root
            placeholder='Scaling factor...'
            type='number'
            className='max-w-[300px]'
            value={scalingFactor}
            onChange={(e) => setScalingFactor(e.target.value)}
          >
            <TextField.Slot>
              <Dumbbell height='16' width='16' />
            </TextField.Slot>
          </TextField.Root>
        </div>
        <Button type='submit'>Save Changes</Button>
      </form>
      <Button onClick={openDeleteAccountDialog} color='red'>
        Delete account
      </Button>
      <ConfirmationDialog
        open={isDeleteAccountDialogOpen}
        onConfirm={onDeleteAccount}
        onCancel={closeDeleteAccountDialog}
        isLoading={isLoading}
        title='Delete account?'
        body='This will permanently delete all data associated with your account. It is recommended that you export your moves before you continue'
      />
    </Box>
  )
}

export default AccountPage
