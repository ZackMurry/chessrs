import { Text } from '@chakra-ui/layout'
import { Box, Button } from '@chakra-ui/react'
import { useState } from 'react'
import { FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateLichessGames, updateOpening } from 'store/boardSlice'
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
  }, [fen, dispatch])

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
      <Button isDisabled={!lastMove} isLoading={isAddLoading} isFullWidth onClick={onAddMove}>
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
    </Box>
  )
}

export default OverviewPanel
