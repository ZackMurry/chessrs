import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Link as ChakraLink, Table, Tbody, Td, Text, Th, Thead, Tr, useToast } from '@chakra-ui/react'
import ErrorToast from 'components/ErrorToast'
import { gql, request } from 'graphql-request'
import { useEffect } from 'react'
import { useState } from 'react'
import { FC } from 'react'
import { TOAST_DURATION } from 'theme'

const MovesPage: FC = () => {
  const [moves, setMoves] = useState<
    { id: string; fenBefore: string; san: string; opening: string; isWhite: boolean; numReviews: number }[]
  >([])
  const [numberOfMoves, setNumberOfMoves] = useState(0)
  const toast = useToast()
  const [pagesLoaded, setPagesLoaded] = useState(0)

  useEffect(() => {
    const fetchMoves = async () => {
      try {
        const query = gql`
          query GetMoves {
            moves {
              id
              fenBefore
              san
              opening
              isWhite
              numReviews
            }
            numberOfMoves
          }
        `
        const data = await request('/api/v1/graphql', query)
        setMoves(data.moves)
        setNumberOfMoves(data.numberOfMoves)
        setPagesLoaded(1)
      } catch (e) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => (
            <ErrorToast description={`Error fetching moves: ${e.response.errors[0].message}`} onClose={options.onClose} />
          )
        })
      }
    }
    fetchMoves()
  }, [toast, setMoves])

  const onLoadMore = async () => {
    try {
      const query = gql`
        query GetMoves($page: Int!) {
          moves(page: $page) {
            id
            fenBefore
            san
            opening
            isWhite
            numReviews
          }
        }
      `
      const data = await request('/api/v1/graphql', query, { page: pagesLoaded })
      setMoves([...moves, ...data.moves])
      setPagesLoaded(pagesLoaded + 1)
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast description={`Error fetching moves: ${e.response?.errors[0]?.message}`} onClose={options.onClose} />
        )
      })
    }
  }

  // todo: searching and filtering
  // todo: deleting moves from this page
  return (
    <Box p='15px 1vw'>
      <Text fontSize='18px' fontWeight='bold' mb='15px' ml='20px'>
        {numberOfMoves} moves
      </Text>
      <Table variant='striped' colorScheme='chessrs'>
        <Thead>
          <Tr>
            <Th color='whiteText'>Opening</Th>
            <Th color='whiteText'>SAN</Th>
            <Th color='whiteText'>Side</Th>
            <Th color='whiteText' isNumeric>
              Reviews
            </Th>
            <Th color='whiteText'>FEN</Th>
          </Tr>
        </Thead>
        <Tbody>
          {moves.map(m => (
            <Tr key={m.id}>
              <Td>{m.opening}</Td>
              <Td>{m.san}</Td>
              <Td>{m.isWhite ? 'White' : 'Black'}</Td>
              <Td isNumeric>{m.numReviews}</Td>
              <Td>
                <ChakraLink isExternal href={`https://lichess.org/analysis?fen=${encodeURIComponent(m.fenBefore)}`}>
                  {m.fenBefore} <ExternalLinkIcon ml='4px' mt='-2px' />
                </ChakraLink>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Flex justifyContent='center' my='25px'>
        {moves.length < numberOfMoves && (
          <Button variant='outline' bg='btnBg' borderColor='btnBorder' onClick={onLoadMore}>
            Load more
          </Button>
        )}
      </Flex>
    </Box>
  )
}

export default MovesPage
