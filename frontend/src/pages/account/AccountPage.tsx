import {
  Box,
  Button,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  SlideFade,
  Text,
  useToast
} from '@chakra-ui/react'
import ErrorToast from 'components/ErrorToast'
import { FC, FormEvent, useState } from 'react'
import { request, gql } from 'graphql-request'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import { setAccount } from 'store/userSlice'
import { TOAST_DURATION } from 'theme'
import { useEffect } from 'react'

const DEFAULT_EASE_FACTOR = 3
const DEFAULT_SCALING_FACTOR = 2

const AccountPage: FC = () => {
  const account = useAppSelector(state => state.user?.account)
  const [easeFactor, setEaseFactor] = useState(String(account?.easeFactor ?? DEFAULT_EASE_FACTOR))
  const [scalingFactor, setScalingFactor] = useState(String(account?.scalingFactor ?? DEFAULT_SCALING_FACTOR))
  const [isLoading, setLoading] = useState(false)
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
      const data = await request('/api/v1/graphql', query, { easeFactor })
      console.log(data)
      dispatch(setAccount(data.updateSettings))
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast
            description={`Error updating ease factor: ${e.response?.errors[0]?.message}`}
            onClose={options.onClose}
          />
        )
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
      const data = await request('/api/v1/graphql', query, { scalingFactor })
      console.log(data)
      dispatch(setAccount(data.updateSettings))
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast
            description={`Error updating scalingFactor: ${e.response?.errors[0]?.message}`}
            onClose={options.onClose}
          />
        )
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
      <Heading color='whiteText'>{account.name}</Heading>
      <form onSubmit={onSubmitEaseFactor}>
        <Heading as='h6' fontSize='2xl' color='whiteText' mt='25px'>
          Ease Factor
        </Heading>
        <Text color='whiteText' fontSize='lg' mt='5px'>
          Your ease factor controls how often moves need to be reviewed. The higher your ease factor, the fewer times you
          will need to review every move.
        </Text>
        <Text color='whiteText' fontSize='lg'>
          Specifically, your ease factor is the time between the first review and the second review, in minutes.
        </Text>
        <NumberInput
          w='sm'
          min={0.1}
          max={1000}
          precision={2}
          step={0.25}
          value={easeFactor}
          onChange={setEaseFactor}
          mt='5px'
        >
          <NumberInputField _focus={{ borderColor: '#757575' }} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <SlideFade in={Number(easeFactor) !== account.easeFactor}>
          <Button type='submit' size='sm' isLoading={isLoading} mt='10px'>
            Save
          </Button>
        </SlideFade>
      </form>
      <form onSubmit={onSubmitScalingFactor}>
        <Heading as='h6' fontSize='2xl' color='whiteText' mt='25px'>
          Scaling Factor
        </Heading>
        <Text color='whiteText' fontSize='lg' mt='5px'>
          Your scaling factor controls how fast the interval between reviews grows. For example, with a scaling factor of 2,
          the time between reviews will double after each review.
        </Text>
        <NumberInput
          w='sm'
          min={0.1}
          max={1000}
          precision={2}
          step={0.25}
          value={scalingFactor}
          onChange={setScalingFactor}
          mt='5px'
        >
          <NumberInputField _focus={{ borderColor: '#757575' }} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <SlideFade in={Number(scalingFactor) !== account.scalingFactor}>
          <Button type='submit' size='sm' isLoading={isLoading} mt='10px'>
            Save
          </Button>
        </SlideFade>
      </form>
    </Box>
  )
}

export default AccountPage
