import { Box, IconButton, useBreakpointValue, useToast } from '@chakra-ui/react'
import { Button } from '@radix-ui/themes'
import DarkTooltip from 'components/DarkTooltip'
import ErrorToast from 'components/ErrorToast'
import { gql, request } from 'graphql-request'
import { Trash2 } from 'lucide-react'
import { FC, useCallback, useEffect, useState } from 'react'
import { GlobalHotKeys, configure } from 'react-hotkeys'
import { useDispatch } from 'react-redux'
import {
  flipBoard,
  traverseBackwards,
  traverseForwards,
  traverseToEnd,
  traverseToStart,
  updateLichessGames,
  updateOpening
} from 'store/boardSlice'
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
  const [currentMove, setCurrentMove] = useState<{
    san: string
    id: string
  } | null>(null)
  const [previousMove, setPreviousMove] = useState<{
    san: string
    id: string
  } | null>(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [isDeleteLoading, setDeleteLoading] = useState(false)

  const handleTraverseForwards = useCallback(() => {
    dispatch(traverseForwards())
  }, [dispatch])

  const handleTraverseBackwards = useCallback(() => {
    dispatch(traverseBackwards())
  }, [dispatch])

  const handleTraverseStart = useCallback(() => {
    dispatch(traverseToStart())
  }, [dispatch])

  const handleTraverseEnd = useCallback(() => {
    dispatch(traverseToEnd())
  }, [dispatch])

  const handleFlipBoard = useCallback(() => {
    dispatch(flipBoard())
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
      const data = (await request('/api/v1/graphql', query, { fen })) as any
      setCurrentMove(data.move)
    } catch (e) {
      console.log(e)
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
    const getPositionInformation = async () => {
      // todo: when skipping to the end, the opening isn't updated to the last available value
      if (!fen.includes('K') || !fen.includes('k')) return
      const query = gql`
        query GetPositionInformation($fen: String!) {
          positionInformation(fen: $fen) {
            white
            draws
            black
            moves {
              uci
              san
            }
            opening {
              eco
              name
            }
          }
        }
      `
      try {
        const data = (await request('/api/v1/graphql', query, { fen })) as any
        dispatch(updateLichessGames(data.positionInformation))
        dispatch(updateOpening(data.positionInformation.opening))
      } catch (e) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => (
            <ErrorToast
              description={`Error getting position information: ${e.response?.errors[0]?.message}`}
              onClose={options.onClose}
            />
          )
        })
      }
    }
    getPositionInformation()
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
      const data = (await request('/api/v1/graphql', query, {
        fenBefore: history[halfMoveCount - 1],
        san: lastMove.san,
        uci: lastMove.uci,
        opening: opening?.name ?? 'Unknown'
      })) as any
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
    TRAVERSE_START: handleTraverseStart,
    TRAVERSE_END: handleTraverseEnd,
    FLIP_BOARD: handleFlipBoard,
    ADD_MOVE: onAddMove
  }

  // todo: a hotkey for traverseToStart and traverseToEnd
  const keyMap = {
    TRAVERSE_FORWARDS: ['right', 'd'],
    TRAVERSE_BACKWARDS: ['left', 'a'],
    TRAVERSE_START: ['s'],
    TRAVERSE_END: ['e'],
    FLIP_BOARD: ['f'],
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
          disabled={Boolean(previousMove) || !Boolean(lastMove)}
          loading={isAddLoading}
          color='gray'
          className='!w-full !text-black !bg-gray-200 border-none hover:!bg-gray-100 disabled:!bg-gray-500 !py-[1.1rem]'
          onClick={onAddMove}
        >
          Add {lastMove?.san || 'Move'}
          {!isMobile ? ' (Space)' : ''}
        </Button>
        <h1 className={`text-xl font-bold mt-[20px] text-offwhite ${isMobile ? 'min-h-[50px]' : ''}`}>
          {opening ? (
            <>
              {opening.name} <span style={{ fontWeight: 'normal' }}>{opening.eco}</span>
            </>
          ) : halfMoveCount === 0 ? (
            'Starting position'
          ) : (
            'Unknown opening'
          )}
        </h1>
        <p className='text-offwhite text-lg mt-2'>Lichess games: {lichessGamesInPosition.toLocaleString()}</p>
        {commonMoves.length > 0 ? (
          <>
            {/* todo: show some stats about the moves */}
            {isMobile ? (
              <h3 className='text-lg mb-[1px] mt-[0.7em] text-offwhite min-h-[60px]'>
                <span style={{ fontWeight: 'bold' }}>Most Common Moves:</span> {commonMoves && commonMoves.join(', ')}
              </h3>
            ) : (
              <>
                <h3 className='text-xl font-bold mb-1 mt-4 text-offwhite'>Most Common Moves:</h3>
                {/* todo: show a bit more data (like number of times of name of opening) */}
                {commonMoves &&
                  commonMoves.map(m => (
                    <h6 className='text-lg mb-1 text-offwhite' key={m}>
                      {m}
                    </h6>
                  ))}
              </>
            )}
          </>
        ) : (
          <h3 className={`text-lg font-bold mb-1 mt-[0.7em] text-offwhite ${isMobile ? 'min-h-[60px]' : ''}`}>
            No common moves
          </h3>
        )}
        <div className='flex justify-between items-center mb-1 mt-1 min-h-[50px]'>
          <h3 className='text-xl font-bold text-offwhite'>Current move: {currentMove?.san ?? 'none'}</h3>
          <DarkTooltip label='Delete current move'>
            <IconButton
              aria-label='Delete current move'
              size='sm'
              borderRadius='5px'
              onClick={onDeleteMove}
              isLoading={isDeleteLoading}
              className='text-black'
              disabled={!currentMove?.san}
            >
              <Trash2 />
            </IconButton>
          </DarkTooltip>
        </div>
      </GlobalHotKeys>
    </Box>
  )
}

export default OverviewPanel
