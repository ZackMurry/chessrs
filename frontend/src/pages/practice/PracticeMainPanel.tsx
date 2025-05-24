import { Flex, Text } from '@chakra-ui/layout'
import { FC, useCallback, useEffect } from 'react'
import { useAppSelector } from 'utils/hooks'
import { useDispatch } from 'react-redux'
import {
  disableBoard,
  loadPosition,
  makeMove,
  resetHalfMoveCount,
  wrongMove,
  wrongMoveReset,
} from 'store/boardSlice'
import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { gql, request } from 'graphql-request'
import ErrorToast from 'components/ErrorToast'
import { TOAST_DURATION } from 'theme'

const PracticeMainPanel: FC = () => {
  const { halfMoveCount, moveSAN } = useAppSelector((state) => ({
    halfMoveCount: state.board.halfMoveCount,
    moveSAN: state.board.moveHistory.length
      ? state.board.moveHistory[0].san
      : '',
  }))
  const dispatch = useDispatch()
  const toast = useToast()

  const [movesInQueue, setMovesInQueue] = useState<
    { fenBefore: string; isWhite: string; san: string; uci: string }[]
  >([])
  const [moveWrong, setMoveWrong] = useState(false)
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout>(null)

  const fetchMoves = useCallback(async () => {
    const query = gql`
      query GetPracticeMoves {
        randomMoves {
          fenBefore
          isWhite
          san
          uci
        }
      }
    `
    try {
      const data = await request('/api/v1/graphql', query)
      setMovesInQueue(data.randomMoves)
      if (!data.randomMoves?.length) {
        console.log('no moves')
        return
      }
      console.log('loading pos from fetch')
      dispatch(
        loadPosition({
          fen: data.randomMoves[0].fenBefore,
          perspective: data.randomMoves[0].isWhite ? 'white' : 'black',
        }),
      )
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: (options) => (
          <ErrorToast
            description={`Error getting move data: ${e.response?.errors[0]?.message}`}
            onClose={options.onClose}
          />
        ),
      })
      dispatch(disableBoard())
    }
  }, [setMovesInQueue, dispatch, toast])

  // For the first load
  useEffect(() => {
    fetchMoves()
  }, [fetchMoves])

  useEffect(() => {
    if (halfMoveCount === 0 || moveWrong || movesInQueue.length === 0) {
      // Prevent loop from useEffect changing dependencies, which calls useEffect, etc
      return
    }
    console.log('move made')
    if (
      moveSAN !== '' &&
      movesInQueue.length &&
      moveSAN !== movesInQueue[0].san
    ) {
      console.warn('wrong move!')
      setMoveWrong(true)
      dispatch(
        wrongMove({
          fen: movesInQueue[0].fenBefore,
          perspective: movesInQueue[0].isWhite ? 'white' : 'black',
        }),
      )
      dispatch(makeMove(movesInQueue[0].uci))
      setResetTimeout(
        setTimeout(() => {
          setMoveWrong(false)
          dispatch(wrongMoveReset())
        }, 3000),
      )
      return
    }
    if (movesInQueue.length === 1) {
      console.log('fetching more moves...')
      dispatch(resetHalfMoveCount())
      fetchMoves()
    } else {
      console.log('next move...')
      const newMovesInQueue = movesInQueue.slice()
      newMovesInQueue.splice(0, 1)
      setMovesInQueue(newMovesInQueue)
      if (newMovesInQueue.length === 0) {
        console.log('no moves')
        return
      }
      dispatch(
        loadPosition({
          fen: newMovesInQueue[0].fenBefore,
          perspective: newMovesInQueue[0].isWhite ? 'white' : 'black',
        }),
      )
    }
    return () => {
      if (resetTimeout) {
        clearTimeout(resetTimeout)
      }
    }
  }, [
    halfMoveCount,
    dispatch,
    setMovesInQueue,
    movesInQueue,
    setMoveWrong,
    moveWrong,
    moveSAN,
    resetTimeout,
    setResetTimeout,
    fetchMoves,
  ])

  // todo: delete move button
  return (
    <Flex
      flexDir='column'
      borderRadius='3px'
      bg='surface'
      borderWidth='2px'
      borderStyle='solid'
      borderColor='surfaceBorder'
      w='100%'
      h='100%'
      p='5%'
    >
      <h3 className='text-2xl font-bold text-offwhite mb-4'>Practice</h3>
      <h6 className='text-md text-offwhite mb-1'>Total moves: 860</h6>
      <h6 className='text-md text-offwhite mb-1'>Practiced: 112</h6>
    </Flex>
  )
}

export default PracticeMainPanel
