import { Box, Heading, Text, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useEffect } from 'react'
import { FC } from 'react'
import { Link } from 'react-router-dom'
import { gql, request } from 'graphql-request'
import { TOAST_DURATION } from 'theme'
import ErrorToast from 'components/ErrorToast'

const DemoInfoPanel: FC = () => {
  const toast = useToast()
  const [numberOfMoves, setNumberOfMoves] = useState(0)
  const [numberOfDueMoves, setNumberOfDueMoves] = useState(0)

  useEffect(() => {
    const fetchMoves = async () => {
      try {
        const query = gql`
          query GetMoves {
            numberOfDueMoves
            numberOfMoves
          }
        `
        const data = (await request('/api/v1/graphql', query)) as any
        setNumberOfDueMoves(data.numberOfDueMoves)
        setNumberOfMoves(data.numberOfMoves)
      } catch (e) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: (options) => (
            <ErrorToast
              description={`Error fetching data: ${e.response?.errors[0]?.message}`}
              onClose={options.onClose}
            />
          ),
        })
      }
    }
    fetchMoves()
  }, [setNumberOfDueMoves, setNumberOfMoves, toast])

  return (
    <Box
      borderRadius='3px'
      bg='surface'
      borderWidth='2px'
      borderStyle='solid'
      borderColor='surfaceBorder'
      h='100%'
      p='5%'
      className='text-offwhite'
    >
      <h1 className='text-2xl font-bold'>You are using a demo account</h1>
      <ul className='list-disc ml-8 mt-2 text-md'>
        <li className='mt-1'>Your account is for one-time use</li>
        <li className='mt-1'>
          All of your account data will be lost when you sign out
        </li>
        <li className='mt-1'>
          You may use the "Import Games from Lichess" button to view sample
          games from the developer's Lichess account
        </li>
        <li className='mt-1'>
          To create a full account, log out and sign in with Lichess
        </li>
      </ul>
    </Box>
  )
}

export default DemoInfoPanel
