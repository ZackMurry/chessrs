import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, IconButton, Link as ChakraLink, Text, useToast } from '@chakra-ui/react'
import DarkTooltip from 'components/DarkTooltip'
import ErrorToast from 'components/ErrorToast'
import { gql, request } from 'graphql-request'
import { useEffect } from 'react'
import { useState } from 'react'
import { FC } from 'react'
import { TOAST_DURATION } from 'theme'
import { Table } from '@radix-ui/themes'
import { MoveEntity } from 'types'

const RepertoirePage: FC = () => {
  const [moves, setMoves] = useState<
    {
      id: string
      fenBefore: string
      san: string
      uci: string
      opening: string
      isWhite: boolean
      numReviews: number
      timeCreated: number
    }[]
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
              uci
              opening
              isWhite
              numReviews
              timeCreated
            }
            numberOfMoves
          }
        `
        const data = (await request('/api/v1/graphql', query)) as any
        setMoves(data.moves)
        setNumberOfMoves(data.numberOfMoves)
        setPagesLoaded(1)
      } catch (e) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => (
            <ErrorToast
              description={`Error fetching moves: ${e?.response?.errors ? e.response.errors[0]?.message : 'unknown'}`}
              onClose={options.onClose}
            />
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
            uci
            opening
            isWhite
            numReviews
          }
        }
      `
      const data = (await request('/api/v1/graphql', query, {
        page: pagesLoaded
      })) as any
      setMoves([...moves, ...data.moves])
      setPagesLoaded(pagesLoaded + 1)
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast
            description={`Error fetching moves: ${e?.response?.errors ? e.response.errors[0]?.message : 'unknown'}`}
            onClose={options.onClose}
          />
        )
      })
    }
  }

  const onExportMoves = async () => {
    // From https://stackoverflow.com/a/60377870/14044362

    let allMoves: MoveEntity[] = []
    try {
      const query = gql`
        query GetMoves {
          moves(limit: -1) {
            fenBefore
            san
            uci
            opening
            isWhite
            numReviews
            lastReviewed
            timeCreated
          }
        }
      `
      const data = (await request('/api/v1/graphql', query)) as any
      allMoves = data.moves
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast
            description={`Error fetching moves: ${e?.response?.errors ? e.response.errors[0]?.message : 'unknown'}`}
            onClose={options.onClose}
          />
        )
      })
    }

    allMoves.forEach(move => {
      move.lastReviewed = Number(move.lastReviewed)
      move.timeCreated = Number(move.timeCreated)
    })

    const a = document.createElement('a')
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(allMoves, null, 2).concat('\n')], {
        type: 'text/plain'
      })
    )
    a.setAttribute('download', 'chessrs_moves.json')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // todo: searching and filtering
  // todo: deleting moves from this page
  return (
    // <Box p='15px 1vw' className='text-offwhite'>
    <Box
      borderRadius='3px'
      bg='surface'
      borderWidth='2px'
      borderStyle='solid'
      borderColor='surfaceBorder'
      p='2%'
      mx='10'
      className='text-offwhite mt-16'
    >
      <Flex justifyContent='space-between' mb='15px' mx='10px'>
        <h2 className='font-bold text-[18px]'>{numberOfMoves} moves</h2>
        <DarkTooltip label='Export moves'>
          <IconButton
            onClick={onExportMoves}
            variant='ghost'
            aria-label='Export moves'
            icon={<DownloadIcon />}
            _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
            _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          />
        </DarkTooltip>
      </Flex>
      <Table.Root size='2' className='w-full'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Opening</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>SAN</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>UCI</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Side</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className='text-right'>Reviews</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>FEN</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Date Added</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {moves.map(m => (
            <Table.Row key={m.id}>
              <Table.Cell>{m.opening}</Table.Cell>
              <Table.Cell>{m.san}</Table.Cell>
              <Table.Cell>{m.uci}</Table.Cell>
              <Table.Cell>{m.isWhite ? 'White' : 'Black'}</Table.Cell>
              <Table.Cell className='text-right'>{m.numReviews}</Table.Cell>
              <Table.Cell>
                <a
                  href={`https://lichess.org/analysis?fen=${encodeURIComponent(m.fenBefore)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center text-blue-600 hover:underline'
                >
                  {m.fenBefore}
                  <ExternalLinkIcon className='ml-1 mt-[1px]' />
                </a>
              </Table.Cell>
              <Table.Cell>{m.timeCreated ? new Date(m.timeCreated).toLocaleString() : ''}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
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

export default RepertoirePage
