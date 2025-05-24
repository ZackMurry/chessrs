import { Flex, Text } from '@chakra-ui/layout'
import { FC, useEffect, useCallback } from 'react'
import { useAppSelector } from 'utils/hooks'
import { useDispatch } from 'react-redux'
import {
  clearMetaData,
  loadPosition,
  makeMove,
  wrongMove,
  wrongMoveReset,
} from 'store/boardSlice'
import { useState } from 'react'
import ErrorToast from 'components/ErrorToast'
import { useToast } from '@chakra-ui/react'
import { request, gql } from 'graphql-request'
import { TOAST_DURATION } from 'theme'

// todo: some way of obviously indicating when there are no more reviews left
// todo: editing and deleting moves from here
const StudyMainPanel: FC = () => {
  const { halfMoveCount, moveSAN } = useAppSelector((state) => ({
    halfMoveCount: state.board.halfMoveCount,
    moveSAN: state.board.moveHistory.length
      ? state.board.moveHistory[0].san
      : '',
  }))
  const dispatch = useDispatch()
  const toast = useToast()

  const [movesInQueue, setMovesInQueue] = useState<
    {
      id: string
      fenBefore: string
      isWhite: string
      uci: string
      san: string
    }[]
  >([])
  const [moveWrong, setMoveWrong] = useState(false)
  const [resetTimeout, setResetTimeout] = useState<NodeJS.Timeout>(null)
  const [reviewsLeft, setReviewsLeft] = useState(0)

  const fetchMoves = useCallback(async () => {
    const query = gql`
      query GetDueMoves {
        dueMoves {
          id
          fenBefore
          isWhite
          uci
          san
        }
        numberOfDueMoves
      }
    `
    try {
      const data = await request('/api/v1/graphql', query)
      setMovesInQueue(data.dueMoves)
      setReviewsLeft(data.numberOfDueMoves)
      if (!data.dueMoves?.length) {
        console.log('no moves')
        return
      }
      dispatch(
        loadPosition({
          fen: data.dueMoves[0].fenBefore,
          perspective: data.dueMoves[0].isWhite ? 'white' : 'black',
        }),
      )
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: (options) => (
          <ErrorToast
            description={`Error getting moves to review: ${e.response?.errors[0]?.message}`}
            onClose={options.onClose}
          />
        ),
      })
    }
  }, [setReviewsLeft, setMovesInQueue, toast, dispatch])

  const sendReviewData = useCallback(
    async (id: string, success: Boolean) => {
      const query = gql`
        mutation ReviewMove($id: String!, $success: Boolean!) {
          reviewMove(id: $id, success: $success) {
            numReviews
          }
        }
      `
      try {
        await request('/api/v1/graphql', query, { id, success })
      } catch (e) {
        toast({
          duration: TOAST_DURATION,
          isClosable: true,
          render: (options) => (
            <ErrorToast
              description={`Error sending review data: ${e.response?.errors[0]?.message}`}
              onClose={options.onClose}
            />
          ),
        })
      }
    },
    [toast],
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
        loadPosition({
          fen: newMovesInQueue[0].fenBefore,
          perspective: newMovesInQueue[0].isWhite ? 'white' : 'black',
        }),
      )
    }
  }, [dispatch, movesInQueue, setMovesInQueue, fetchMoves])

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
      sendReviewData(movesInQueue[0].id, false)
      dispatch(
        wrongMove({
          fen: movesInQueue[0].fenBefore,
          perspective: movesInQueue[0].isWhite ? 'white' : 'black',
        }),
      )
      dispatch(makeMove(movesInQueue[0].uci))
      setResetTimeout(
        setTimeout(() => {
          dispatch(wrongMoveReset())
          setMoveWrong(false)
          nextMove()
        }, 3000),
      )
      return
    }
    console.log('hmc: ', halfMoveCount)
    sendReviewData(movesInQueue[0].id, true).then(nextMove)
    setReviewsLeft((l) => l - 1)
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
    sendReviewData,
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
      <h1 className='text-2xl font-bold mt-2 text-offwhite mb-1'>
        {reviewsLeft} left to study
      </h1>
      <h6 className='text-lg text-offwhite mb-1'>
        Make the correct move according to the move you created for this
        position.
      </h6>
    </Flex>
  )
}

export default StudyMainPanel
