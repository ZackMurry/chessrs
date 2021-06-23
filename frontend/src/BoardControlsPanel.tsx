import { IconButton } from '@chakra-ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { FC } from 'react'
import { useAppDispatch, useAppSelector } from './hooks'
import { traverseBackwards, traverseForwards } from './board/boardSlice'

const BoardControlsPanel: FC = () => {
  const { pgn, halfMoveCount, historySize } = useAppSelector(state => ({
    pgn: state.board.pgn,
    halfMoveCount: state.board.halfMoveCount,
    historySize: state.board.history.length
  }))
  const dispatch = useAppDispatch()
  return (
    <Flex
      flexDir='column'
      justifyContent='space-between'
      borderRadius='10px'
      bg='gray.700'
      w='100%'
      h='100%'
      p='5%'
      fontWeight='bold'
    >
      <Box>
        <Text fontSize='lg'>{pgn}</Text>
      </Box>
      <Flex>
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label='Back'
          onClick={() => dispatch(traverseBackwards())}
          disabled={halfMoveCount <= 0}
        />
        <IconButton
          icon={<ChevronRightIcon />}
          aria-label='Advance forward'
          onClick={() => dispatch(traverseForwards())}
          disabled={halfMoveCount >= historySize - 1}
        />
      </Flex>
    </Flex>
  )
}

export default BoardControlsPanel
