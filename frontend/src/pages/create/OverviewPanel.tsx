import { DeleteIcon } from '@chakra-ui/icons'
import { Text } from '@chakra-ui/layout'
import { Box, Button, Flex, IconButton, useBreakpointValue, useToast } from '@chakra-ui/react'
import DarkTooltip from 'components/DarkTooltip'
import ErrorToast from 'components/ErrorToast'
import { gql, request } from 'graphql-request'
import { FC, useCallback, useEffect, useState } from 'react'
import { GlobalHotKeys, configure } from 'react-hotkeys'
import { useDispatch } from 'react-redux'
import { traverseBackwards, traverseForwards, updateLichessGames, updateOpening } from 'store/boardSlice'
import { TOAST_DURATION } from 'theme'
import { useAppSelector } from 'utils/hooks'

configure({ ignoreKeymapAndHandlerChangesByDefault: false })

const OverviewPanel: FC = () => {
  const { lastMove, lichessGamesInPosition, commonMoves, fen, opening, history, halfMoveCount } = useAppSelector(state => ({
    lastMove: state.board.moveHistory.length > 0 ? state.board.moveHistory[state.board.halfMoveCount - 1] : null,
    lichessGamesInPosition:
      state.board.games.lichess.white + state.board.games.lichess.draws + state.board.games.lichess.black,
    commonMoves: state.board.games.lichess.moves.map(m => m.san),
    fen: state.board.fen,
    opening: state.board.opening,
    history: state.board.history,
    halfMoveCount: state.board.halfMoveCount
  }))

  const dispatch = useDispatch()
  const toast = useToast()

  const [isAddLoading, setAddLoading] = useState(false)
  const [currentMove, setCurrentMove] = useState<{ san: string; id: string } | null>(null)
  const [previousMove, setPreviousMove] = useState<{ san: string; id: string } | null>(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [isDeleteLoading, setDeleteLoading] = useState(false)

  const handleTraverseForwards = useCallback(() => {
    dispatch(traverseForwards())
  }, [dispatch])

  const handleTraverseBackwards = useCallback(() => {
    dispatch(traverseBackwards())
  }, [dispatch])

  const getMoveForPosition = useCallback(async () => {
    // todo: previousMove isn't updated correctly when skipping to the end or beginning of PGNs
    setPreviousMove(currentMove)
    setCurrentMove(null)
    const query = gql`
      query GetMoveByFen($fen: String!) {
        move(fenBefore: $fen) {
          san
          id
        }
      }
    `
    try {
      const data = await request('/api/v1/graphql', query, { fen })
      setCurrentMove(data.move)
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast
            description={`Error getting current move for position: ${e.response?.errors[0]?.message}`}
            onClose={options.onClose}
          />
        )
      })
    }
    // Adding currentMove as a dependency would make useEffect be called in a loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentMove, history, fen, toast])

  useEffect(() => {
    console.log('fetching games')
    // todo: when skipping to the end, the opening isn't updated to the last available value
    // todo: change back to lichess database once issue on GitHub is fixed
    fetch(
      `https://explorer.lichess.ovh/masters?variant=standard&speeds[]=bullet&speeds[]=blitz&speeds[]=rapid&speeds[]=classical&ratings[]=1600&ratings[]=2500&moves=6&fen=${fen}`
    )
      .then(result => result.json())
      .then(json => {
        dispatch(updateLichessGames(json))
        return json
      })
      .then(json => dispatch(updateOpening(json.opening)))
      .catch(() =>
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => <ErrorToast description='Error getting games from Lichess' onClose={options.onClose} />
        })
      )
    getMoveForPosition()
  }, [fen, dispatch, getMoveForPosition, toast])

  const onAddMove = useCallback(async () => {
    if (previousMove || !Boolean(lastMove?.san) || isAddLoading) {
      return
    }
    setAddLoading(true)
    setPreviousMove(currentMove)
    setCurrentMove(null)
    console.log('adding move')
    const query = gql`
      mutation CreateMove($fenBefore: String!, $san: String!, $uci: String!, $opening: String!) {
        createMove(fenBefore: $fenBefore, san: $san, uci: $uci, opening: $opening) {
          san
          id
        }
      }
    `
    try {
      console.log('creating move')
      console.log(history, halfMoveCount, lastMove.san, lastMove.uci, opening)
      const data = await request('/api/v1/graphql', query, {
        fenBefore: history[halfMoveCount - 1],
        san: lastMove.san,
        uci: lastMove.uci,
        opening: opening?.name ?? 'Unknown'
      })
      console.log('created move')
      console.log(data)
      setPreviousMove(data.createMove)
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast description={`Error creating move: ${e.response?.errors[0]?.message}`} onClose={options.onClose} />
        )
      })
    }
    setAddLoading(false)
  }, [
    setAddLoading,
    setPreviousMove,
    history,
    opening,
    setCurrentMove,
    previousMove,
    isAddLoading,
    toast,
    currentMove,
    halfMoveCount,
    lastMove
  ])

  const onDeleteMove = async () => {
    console.log('Deleting ', currentMove.san)
    setDeleteLoading(true)
    const query = gql`
      mutation DeleteMove($id: String!) {
        deleteMove(id: $id) {
          id
        }
      }
    `
    try {
      await request('/api/v1/graphql', query, { id: currentMove.id })
      setCurrentMove(null)
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast description={`Error deleting move: ${e.response?.errors[0]?.message}`} onClose={options.onClose} />
        )
      })
    }
    setDeleteLoading(false)
  }

  const handlers = {
    TRAVERSE_FORWARDS: handleTraverseForwards,
    TRAVERSE_BACKWARDS: handleTraverseBackwards,
    ADD_MOVE: onAddMove
  }

  // todo: a hotkey for traverseToStart and traverseToEnd
  const keyMap = {
    TRAVERSE_FORWARDS: ['right', 'd'],
    TRAVERSE_BACKWARDS: ['left', 'a'],
    ADD_MOVE: 'space'
  }

  return (
    <Box
      borderRadius='3px'
      bg='surface'
      borderWidth='2px'
      borderStyle='solid'
      borderColor='surfaceBorder'
      w='100%'
      h='100%'
      p='5%'
    >
      <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
        <Button
          isDisabled={Boolean(previousMove) || !Boolean(lastMove)}
          isLoading={isAddLoading}
          isFullWidth
          onClick={onAddMove}
        >
          Add {lastMove?.san || 'Move'}
          {!isMobile ? ' (Space)' : ''}
        </Button>
        {opening ? (
          <Text fontSize={{ base: '1.1em', sm: '1.4em' }} fontWeight='bold' mt='20px' color='whiteText'>
            {opening.name} <span style={{ fontWeight: 'normal' }}>{opening.eco}</span>
          </Text>
        ) : halfMoveCount === 0 ? (
          <Text fontSize={{ base: '1.1em', sm: '1.4em' }} mt='20px' color='whiteText'>
            Starting position
          </Text>
        ) : (
          <Text fontSize={{ base: '1.1em', sm: '1.4em' }} mt='20px' color='whiteText'>
            Unknown opening
          </Text>
        )}
        {!isMobile && (
          <Text fontSize='18px' fontWeight='bold' mt='0.8rem' color='whiteText'>
            Times Reached
          </Text>
        )}
        <Text fontSize={{ base: '1.1em', sm: '1.4em' }} mt='5px' color='whiteText'>
          Lichess games: {lichessGamesInPosition}
        </Text>
        {commonMoves.length > 0 ? (
          <>
            {/* todo: show some stats about the moves */}
            {isMobile ? (
              <Text fontSize={{ base: '1.1em', sm: '1.4em' }} mb='1px' mt='0.7em' color='whiteText'>
                <span style={{ fontWeight: 'bold' }}>Common Moves</span> {commonMoves.join(', ')}
              </Text>
            ) : (
              <>
                <Text fontSize='1.4em' fontWeight='bold' mb='5px' mt='20px' color='whiteText'>
                  Most Common Moves
                </Text>
                {commonMoves.map(m => (
                  <Text fontSize='1.4em' mb='1px' key={m} color='whiteText'>
                    {m}
                  </Text>
                ))}
              </>
            )}
          </>
        ) : (
          <Text fontSize='1.4em' mb='1px' mt='20px' color='whiteText'>
            There are no moves found in this position
          </Text>
        )}
        {currentMove?.san ? (
          <Flex justifyContent='space-between' alignItems='center' mb='5px' mt='0.8em'>
            <Text fontSize={{ base: '1.1em', sm: '1.4em' }} fontWeight='bold' color='whiteText'>
              Current move: {currentMove.san}
            </Text>
            <DarkTooltip label='Delete current move for position'>
              <IconButton
                aria-label='Delete current move for position'
                borderRadius='5px'
                onClick={onDeleteMove}
                isLoading={isDeleteLoading}
              >
                <DeleteIcon />
              </IconButton>
            </DarkTooltip>
          </Flex>
        ) : (
          <Text fontSize={{ base: '1.1em', sm: '1.4em' }} fontWeight='bold' mb='5px' mt='0.8em' color='whiteText'>
            This position does not have a move
          </Text>
        )}
      </GlobalHotKeys>
    </Box>
  )
}

export default OverviewPanel
