import { Flex, Text } from '@chakra-ui/layout'
import { FC, useCallback, useEffect } from 'react'
import { useAppSelector } from 'utils/hooks'
import { useDispatch } from 'react-redux'
import { disableBoard, loadPosition, makeMove, resetHalfMoveCount, wrongMove, wrongMoveReset } from 'store/boardSlice'
import { useState } from 'react'
import { MoveEntity } from 'types'
import { useToast } from '@chakra-ui/react'
import ErrorToast from 'components/ErrorToast'
import { TOAST_DURATION } from 'theme'

const PracticeMainPanel: FC = () => {
  const { halfMoveCount, moveSAN } = useAppSelector(state => ({
    halfMoveCount: state.board.halfMoveCount,
    moveSAN: state.board.moveHistory.length ? state.board.moveHistory[0].san : ''
  }))
  const dispatch = useDispatch()
  const toast = useToast()

  const [movesInQueue, setMovesInQueue] = useState<MoveEntity[]>([])
  const [moveWrong, setMoveWrong] = useState(false)
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout>(null)

  const fetchMoves = useCallback(async () => {
    const response = await fetch('/api/v1/moves/need-practice')
    if (!response.ok) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast description={`Error getting move data (status: ${response.status})`} onClose={options.onClose} />
        )
      })
      dispatch(disableBoard())
      return
    }
    const moves = await response.json()
    setMovesInQueue(moves)
    if (moves.length === 0) {
      console.log('no moves')
      return
    }
    console.log('loading pos from fetch')
    dispatch(loadPosition({ fen: moves[0].fenBefore, perspective: moves[0].isWhite ? 'white' : 'black' }))
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
    if (moveSAN !== '' && movesInQueue.length && moveSAN !== movesInQueue[0].san) {
      console.warn('wrong move!')
      setMoveWrong(true)
      dispatch(wrongMove({ fen: movesInQueue[0].fenBefore, perspective: movesInQueue[0].isWhite ? 'white' : 'black' }))
      dispatch(makeMove(movesInQueue[0].uci))
      setResetTimeout(
        setTimeout(() => {
          setMoveWrong(false)
          dispatch(wrongMoveReset())
        }, 3000)
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
        loadPosition({ fen: newMovesInQueue[0].fenBefore, perspective: newMovesInQueue[0].isWhite ? 'white' : 'black' })
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
    fetchMoves
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
      <Text fontSize='16px' mb='5px' mt='15px' color='whiteText'>
        Practicing is like studying, except it doesn't rely on an Spaced Repetition algorithm. Instead, you are given a
        random move. Because of this, you can do as many practices you'd like at any time. Practice is independent from your
        studying.
      </Text>
      <Text fontSize='16px' mb='5px' mt='15px' color='whiteText'>
        All you have to do is make the move that you added on the board. When you make an incorrect move, the correct move
        will be shown and highlighted.
      </Text>
    </Flex>
  )
}

export default PracticeMainPanel
