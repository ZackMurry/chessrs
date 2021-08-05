import { Text } from '@chakra-ui/layout'
import { Box, Button, useBreakpointValue, useToast } from '@chakra-ui/react'
import ErrorToast from 'components/ErrorToast'
import { FC, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { clearLichessGames, updateLichessGames, updateOpening } from 'store/boardSlice'
import theme, { TOAST_DURATION } from 'theme'
import { MoveEntity } from 'types'
import { useAppSelector } from 'utils/hooks'

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
  const [currentMove, setCurrentMove] = useState<MoveEntity | null>(null)
  const [previousMove, setPreviousMove] = useState<MoveEntity | null>(null)
  const [isLichessDataLoading, setLichessDataLoading] = useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false })

  console.log('lastMove: ', lastMove)

  const getMoveForPosition = useCallback(async () => {
    setPreviousMove(currentMove)
    setCurrentMove(null)
    const response = await fetch(`/api/v1/moves/fen/${fen}`)
    if (!response.ok) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast
            description={`Error getting current move for position (status: ${response.status})`}
            onClose={options.onClose}
          />
        )
      })
      return
    }
    if (response.status === 204) {
      console.log('no current move')
      setCurrentMove(null)
    } else {
      setCurrentMove(await response.json())
    }
    // Adding currentMove as a dependency would make useEffect be called in a loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentMove, history, fen, toast])

  useEffect(() => {
    console.log('fetching games')
    setLichessDataLoading(true)
    // dispatch(clearLichessGames())
    fetch(
      `https://explorer.lichess.ovh/lichess?variant=standard&speeds[]=bullet&speeds[]=blitz&speeds[]=rapid&speeds[]=classical&ratings[]=1600&ratings[]=2500&moves=6&fen=${fen}`
    )
      .then(result => result.json())
      .then(json => {
        dispatch(updateLichessGames(json))
        return json
      })
      .then(json => dispatch(updateOpening(json.opening)))
      .then(() => setLichessDataLoading(false))
      .catch(() =>
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => <ErrorToast description='Error getting games from Lichess' onClose={options.onClose} />
        })
      )
    getMoveForPosition()
  }, [fen, dispatch, getMoveForPosition, setLichessDataLoading, toast])

  const onAddMove = async () => {
    setAddLoading(true)
    setPreviousMove(currentMove)
    setCurrentMove(null)
    console.log('adding move')
    const response = await fetch('/api/v1/moves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fenBefore: history[halfMoveCount - 1],
        fenAfter: history[halfMoveCount],
        san: lastMove.san,
        uci: lastMove.uci,
        isWhite: history.length % 2 === 0
      })
    })
    if (response.ok) {
      setAddLoading(false)
      const json = await response.json()
      setPreviousMove(json)
    } else {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast description={`Error creating move (status: ${response.status})`} onClose={options.onClose} />
        )
      })
    }
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
      {/* todo: don't allow users to add already added moves */}
      <Button
        isDisabled={Boolean(previousMove) || !Boolean(lastMove)}
        isLoading={isAddLoading}
        isFullWidth
        onClick={onAddMove}
      >
        Add {lastMove?.san || 'Move'} (A)
      </Button>
      {opening ? (
        <Text fontSize={{ base: '1.1em', sm: '1.4em' }} fontWeight='bold' mt='20px' color='whiteText'>
          {opening.name} <span style={{ fontWeight: 'normal' }}>{opening.eco}</span>
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
        Lichess games: {isLichessDataLoading ? 'Loading...' : lichessGamesInPosition}
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
        <Text fontSize='1.1em' mb='1px' mt='20px' color='whiteText'>
          There are no moves found in this position
        </Text>
      )}
      {currentMove?.san ? (
        <Text fontSize={{ base: '1.1em', sm: '1.4em' }} fontWeight='bold' mb='5px' mt='0.8em' color='whiteText'>
          This position already has a move: {currentMove.san}
        </Text>
      ) : (
        <Text fontSize={{ base: '1.1em', sm: '1.4em' }} fontWeight='bold' mb='5px' mt='0.8em' color='whiteText'>
          This position does not have a move
        </Text>
      )}
    </Box>
  )
}

export default OverviewPanel
