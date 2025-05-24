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
        const data = await request('/api/v1/graphql', query)
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

  return (
    <Box borderRadius='3px' bg='surface' borderWidth='2px' borderStyle='solid' borderColor='surfaceBorder' h='100%' p='5%'>
      <Heading as='h6' fontSize='2xl'>
        {numberOfMoves} Move{numberOfMoves !== 1 ? 's' : ''} Learned
      </Heading>
      <Text fontSize='18px' mt='10px'>
        {numberOfDueMoves} move{numberOfDueMoves !== 1 ? 's' : ''} need review
      </Text>
      <Link to='/moves'>
        <Text fontSize='18px' mt='10px' textDecor='underline'>
          View moves
        </Text>
      </Link>
    </Box>
  )
}

export default DashboardMoveData
