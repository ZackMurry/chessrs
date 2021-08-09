import { Flex, Text } from '@chakra-ui/layout'
import { FC, useEffect, useCallback } from 'react'
import { useAppSelector } from 'utils/hooks'
import { useDispatch } from 'react-redux'
import { clearMetaData, loadPosition, makeMove, wrongMove, wrongMoveReset } from 'store/boardSlice'
import { useState } from 'react'
import { MoveEntity } from 'types'
import ErrorToast from 'components/ErrorToast'
import { useToast } from '@chakra-ui/react'
import { rawRequest, gql } from 'graphql-request'
import { TOAST_DURATION } from 'theme'

interface GetReviewsResponse {
  moves: MoveEntity[]
  total: number
}

// todo: some way of obviously indicating when there are no more reviews left
const StudyMainPanel: FC = () => {
  const { halfMoveCount, moveSAN } = useAppSelector(state => ({
    halfMoveCount: state.board.halfMoveCount,
    moveSAN: state.board.moveHistory.length ? state.board.moveHistory[0].san : ''
  }))
  const dispatch = useDispatch()
  const toast = useToast()

  const [movesInQueue, setMovesInQueue] = useState<MoveEntity[]>([])
  const [moveWrong, setMoveWrong] = useState(false)
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout>(null)
  const [reviewsLeft, setReviewsLeft] = useState(0)

  const fetchMoves = useCallback(async () => {
    const response = await fetch('/api/v1/moves/need-review')
    if (!response.ok) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: options => (
          <ErrorToast description={`Error getting moves to review (status: ${response.status})`} onClose={options.onClose} />
        )
      })
      return
    }
    const json = (await response.json()) as GetReviewsResponse
    setMovesInQueue(json.moves)
    setReviewsLeft(json.total)
    if (json.moves.length === 0) {
      console.log('no moves')
      return
    }
    dispatch(loadPosition({ fen: json.moves[0].fenBefore, perspective: json.moves[0].isWhite ? 'white' : 'black' }))
  }, [setReviewsLeft, setMovesInQueue, toast, dispatch])

  const sendReviewData = useCallback(
    async (move: MoveEntity, success: Boolean) => {
      const query = gql`
        mutation ReviewMove($id: String!, $success: Boolean!) {
          reviewMove(id: $id, success: $success) {
            numReviews
          }
        }
      `
      try {
        await rawRequest('/api/v1/graphql', query, { id: move.id, success })
      } catch (e) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: options => (
            <ErrorToast
              description={`Error sending review data: ${e.response.errors[0].message}`}
              onClose={options.onClose}
            />
          )
        })
      }
    },
    [toast]
  )

  // For the first load
  useEffect(() => {
    console.log('first load')
    fetchMoves()
  }, [dispatch, fetchMoves])

  const nextMove = useCallback(() => {
    dispatch(clearMetaData())
    if (movesInQueue.length === 1) {
      console.log('fetching more moves...')
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
  }, [dispatch, movesInQueue, setMovesInQueue, fetchMoves])

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
    nextMove,
    sendReviewData
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
      <Text fontSize='1.4em' fontWeight='bold' mb='5px' mt='0.4em' color='whiteText'>
        {reviewsLeft} left to study
      </Text>
      <Text fontSize='16px' mb='5px' mt='0.4em' color='whiteText'>
        Studying in ChesSRS reviews the moves that you've added for positions. This uses a Spaced Repetition algorithm that
        spaces out your reviews automatically, giving you new reviews each day.
      </Text>
      <Text fontSize='16px' mb='5px' mt='0.4em' color='whiteText'>
        All you have to do is make the move that you added on the board. When you make an incorrect move, the correct move
        will be shown and highlighted.
      </Text>
    </Flex>
  )
}

export default StudyMainPanel
