import { Text } from '@chakra-ui/layout'
import { Box, Button } from '@chakra-ui/react'
import { FC, useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateLichessGames, updateOpening } from 'store/boardSlice'
import { MoveEntity } from 'types'
import { useAppSelector } from 'utils/hooks'

const OverviewPanel: FC = () => {
  const { lastMove, lichessGamesInPosition, commonMoves, fen, opening, history, halfMoveCount } = useAppSelector(state => ({
    lastMove: state.board.moveHistory.length > 0 ? state.board.moveHistory[state.board.moveHistory.length - 1] : null,
    lichessGamesInPosition:
      state.board.games.lichess.white + state.board.games.lichess.draws + state.board.games.lichess.black,
    commonMoves: state.board.games.lichess.moves.map(m => m.san),
    fen: state.board.fen,
    opening: state.board.opening,
    history: state.board.history,
    halfMoveCount: state.board.halfMoveCount
  }))

  const dispatch = useDispatch()

  const [isAddLoading, setAddLoading] = useState(false)
  const [currentMove, setCurrentMove] = useState<MoveEntity | null>(null)
  const [previousMove, setPreviousMove] = useState<MoveEntity | null>(null)

  console.log('current move: ', currentMove)
  console.log('previous move: ', previousMove)

  const getMoveForPosition = useCallback(async () => {
    setPreviousMove(currentMove)
    setCurrentMove(null)
    const response = await fetch(`/api/v1/moves/fen/${history[history.length - 1]}`)
    if (!response.ok) {
      console.error('Error getting move for position', response.status)
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
  }, [setCurrentMove, history])

  useEffect(() => {
    console.log('fetching games')
    fetch(
      `https://explorer.lichess.ovh/lichess?variant=standard&speeds[]=bullet&speeds[]=blitz&speeds[]=rapid&speeds[]=classical&ratings[]=1600&ratings[]=2500&moves=6&fen=${fen}`
    )
      .then(result => result.json())
      .then(json => {
        dispatch(updateLichessGames(json))
        return json
      })
      .then(json => dispatch(updateOpening(json.opening)))
    getMoveForPosition()
  }, [fen, dispatch, getMoveForPosition])

  const onAddMove = async () => {
    setAddLoading(true)
    // todo: error message if failed
    await fetch('/api/v1/moves', {
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
    setAddLoading(false)
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
      <Button isDisabled={!lastMove || Boolean(previousMove)} isLoading={isAddLoading} isFullWidth onClick={onAddMove}>
        Add {lastMove?.san || 'Move'} (A)
      </Button>
      {opening && (
        <Text fontSize='18px' fontWeight='bold' mt='20px' color='whiteText'>
          {opening.name} <span style={{ fontWeight: 'normal' }}>{opening.eco}</span>
        </Text>
      )}
      <Text fontSize='18px' fontWeight='bold' mb='5px' mt='25px' color='whiteText'>
        Times Reached
      </Text>
      <Text fontSize='16px' mb='3px' color='whiteText'>
        Lichess games: {lichessGamesInPosition}
      </Text>
      {commonMoves.length > 0 && (
        <>
          <Text fontSize='18px' fontWeight='bold' mb='5px' mt='20px' color='whiteText'>
            Most Common Moves
          </Text>
          {/* todo: show some stats about the moves */}
          {commonMoves.map(m => (
            <Text fontSize='16px' mb='1px' key={m} color='whiteText'>
              {m}
            </Text>
          ))}
        </>
      )}
      {currentMove?.san && (
        <Text fontSize='16px' fontWeight='bold' mb='5px' mt='20px' color='whiteText'>
          This position already has a move: {currentMove.san}
        </Text>
      )}
    </Box>
  )
}

export default OverviewPanel
