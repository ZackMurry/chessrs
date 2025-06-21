import { Box, Heading, Text, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useEffect } from 'react'
import { FC } from 'react'
import { Link } from 'react-router-dom'
import { gql, request } from 'graphql-request'
import { TOAST_DURATION } from 'theme'
import ErrorToast from 'components/ErrorToast'

const DashboardMoveData: FC = () => {
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
          render: options => (
            <ErrorToast description={`Error fetching data: ${e.response?.errors[0]?.message}`} onClose={options.onClose} />
          )
        })
      }
    }
    fetchMoves()
  }, [setNumberOfDueMoves, setNumberOfMoves, toast])

  const allMovesDue = numberOfMoves === numberOfDueMoves && numberOfMoves !== 0
  const noDueMoves = numberOfDueMoves === 0 && numberOfMoves !== 0

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
      <Heading as='h6' fontSize='2xl'>
        Welcome to Chessrs!
      </Heading>
      <Text fontSize='18px' mt='10px'>
        Use the "Create" tab to study positions and add new moves to your repertoire. Then, use the "Study" tab to practice
        your moves according to the Spaced Repetition System (SRS) schedule. You can freely practice your moves randomly
        using the "Practice" tab.
      </Text>
      <Link to='/repertoire'>
        <Text fontSize='18px' mt='30px' textDecor='underline'>
          View your repertoire
        </Text>
      </Link>
      <Text fontSize='18px' mt='10px'>
        Your repertoire has {numberOfMoves} move{numberOfMoves !== 1 ? 's' : ''} total and {numberOfDueMoves} due move
        {numberOfDueMoves !== 1 ? 's' : ''}. {allMovesDue ? "You'd better get to work!" : ''}
        {noDueMoves ? 'Well done!' : ''}
      </Text>
    </Box>
  )
}

export default DashboardMoveData
