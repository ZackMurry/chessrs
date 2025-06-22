import { Box, useToast } from '@chakra-ui/react'
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
      <h1 className='font-bold text-xl lg:text-2xl'>Welcome to Chessrs!</h1>
      <p className='mt-[10px] text-md lg:text-lg'>
        Use the "Create" tab to study positions and add new moves to your repertoire. Then, use the "Study" tab to practice
        your moves according to the Spaced Repetition System (SRS) schedule. You can freely practice your moves randomly
        using the "Practice" tab.
      </p>
      <Link to='/repertoire'>
        <h6 className='mt-[30px] text-lg underline'>View your repertoire</h6>
      </Link>
      <p className='mt-[10px] text-md lg:text-lg'>
        Your repertoire has {numberOfMoves} move{numberOfMoves !== 1 ? 's' : ''} total and {numberOfDueMoves} due move
        {numberOfDueMoves !== 1 ? 's' : ''}. {allMovesDue ? "You'd better get to work!" : ''}
        {noDueMoves ? 'Well done!' : ''}
      </p>
    </Box>
  )
}

export default DashboardMoveData
