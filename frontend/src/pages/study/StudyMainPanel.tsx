import { Flex, Text } from '@chakra-ui/layout'
import { FC, useEffect } from 'react'
import { useAppSelector } from 'utils/hooks'
import { useDispatch } from 'react-redux'
import {
  clearMetaData,
  loadPosition,
  makeMove,
  resetBoard,
  resetHalfMoveCount,
  wrongMove,
  wrongMoveReset
} from 'store/boardSlice'
import { useState } from 'react'
import { MoveEntity } from 'types'
import { useCallback } from 'react'

interface GetReviewsResponse {
  moves: MoveEntity[]
  total: number
}

const StudyMainPanel: FC = () => {
  const { halfMoveCount, moveSAN } = useAppSelector(state => ({
    halfMoveCount: state.board.halfMoveCount,
    moveSAN: state.board.moveHistory.length ? state.board.moveHistory[0].san : ''
  }))
  const dispatch = useDispatch()
  const [movesInQueue, setMovesInQueue] = useState<MoveEntity[]>([])
  const [moveWrong, setMoveWrong] = useState(false)
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout>(null)
  const [reviewsLeft, setReviewsLeft] = useState(0)

  const fetchMoves = async (): Promise<MoveEntity[]> => {
    const response = await fetch('/api/v1/moves/need-review')
    if (!response.ok) {
      console.error('Error fetching moves. Status: ', response.status)
      return
    }
    const json = (await response.json()) as GetReviewsResponse
    setMovesInQueue(json.moves)
    setReviewsLeft(json.total)
    return json.moves
  }

  const sendReviewData = async (move: MoveEntity, success: Boolean) => {
    const response = await fetch(`/api/v1/moves/study/${move.id}?success=${success}`, {
      method: 'POST'
    })
    if (!response.ok) {
      console.error('Error sending review data. Status: ', response.status)
    }
  }

  // For the first load
  useEffect(() => {
    console.log('first load')
    fetchMoves().then(moves => {
      if (moves.length === 0) {
        console.log('no moves')
        return
      }
      dispatch(loadPosition({ fen: moves[0].fenBefore, perspective: moves[0].isWhite ? 'white' : 'black' }))
    })
  }, [dispatch])

  const nextMove = useCallback(() => {
    dispatch(clearMetaData())
    if (movesInQueue.length === 1) {
      console.log('fetching more moves...')
      fetchMoves().then(moves => {
        if (moves.length === 0) {
          console.log('no moves')
          return
        }
        console.log('loading pos from fetch')
        dispatch(loadPosition({ fen: moves[0].fenBefore, perspective: moves[0].isWhite ? 'white' : 'black' }))
      })
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
  }, [dispatch, movesInQueue, setMovesInQueue])

  useEffect(() => {
    if (halfMoveCount === 0 || moveWrong || movesInQueue.length === 0) {
      // Prevent loop from useEffect changing dependencies, which calls useEffect, etc
      return
    }
    console.log('move made')
    if (moveSAN !== '' && movesInQueue.length && moveSAN !== movesInQueue[0].san) {
      console.warn('wrong move!')
      setMoveWrong(true)
      sendReviewData(movesInQueue[0], false)
      dispatch(wrongMove({ fen: movesInQueue[0].fenBefore, perspective: movesInQueue[0].isWhite ? 'white' : 'black' }))
      dispatch(makeMove(movesInQueue[0].uci))
      setResetTimeout(
        setTimeout(() => {
          dispatch(wrongMoveReset())
          setMoveWrong(false)
          nextMove()
        }, 3000)
      )
      return
    }
    console.log('hmc: ', halfMoveCount)
    sendReviewData(movesInQueue[0], true).then(nextMove)
    setReviewsLeft(l => l - 1)
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
    setReviewsLeft,
    nextMove
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
        Studying in ChesSRS reviews the moves that you've added for positions. This uses a Spaced Repetition algorithm (SM-2)
        that spaces out your reviews automatically, giving you new reviews each day.
      </Text>
      <Text fontSize='16px' mb='5px' mt='15px' color='whiteText'>
        All you have to do is make the move that you added on the board. When you make an incorrect move, the correct move
        will be shown and highlighted.
      </Text>
      <Text fontSize='18px' fontWeight='bold' mb='5px' mt='15px' color='whiteText'>
        {reviewsLeft} left to study
      </Text>
    </Flex>
  )
}

export default StudyMainPanel
