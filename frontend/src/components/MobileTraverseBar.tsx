import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import { FC } from 'react'
import { traverseBackwards, traverseForwards, traverseToEnd, traverseToStart } from 'store/boardSlice'
import { useAppDispatch, useAppSelector } from 'utils/hooks'

const MobileTraverseBar: FC = () => {
  const dispatch = useAppDispatch()
  const { halfMoveCount, historySize } = useAppSelector(state => ({
    halfMoveCount: state.board.halfMoveCount,
    historySize: state.board.moveHistory.length
  }))

  const onBack = () => dispatch(traverseBackwards())
  const onForward = () => dispatch(traverseForwards())
  const onStart = () => dispatch(traverseToStart())
  const onEnd = () => dispatch(traverseToEnd())

  return (
    <Flex
      w='100%'
      pos='fixed'
      bottom='0'
      left='0'
      bg='surface'
      zIndex='10'
      justifyContent='center'
      alignItems='center'
      py='10px'
    >
      <IconButton
        aria-label='Start'
        icon={<ArrowLeftIcon />}
        size='lg'
        onClick={onStart}
        isDisabled={halfMoveCount <= 0}
        borderRadius='3px'
        mx='5px'
      />
      <IconButton
        aria-label='Back'
        icon={<ChevronLeftIcon fontSize='4xl' />}
        size='lg'
        onClick={onBack}
        isDisabled={halfMoveCount <= 0}
        borderRadius='3px'
        mx='5px'
      />
      <IconButton
        aria-label='Forward'
        icon={<ChevronRightIcon fontSize='4xl' />}
        size='lg'
        onClick={onForward}
        isDisabled={halfMoveCount >= historySize}
        borderRadius='3px'
        mx='5px'
      />
      <IconButton
        aria-label='End'
        icon={<ArrowRightIcon />}
        size='lg'
        onClick={onEnd}
        isDisabled={halfMoveCount >= historySize}
        borderRadius='3px'
        mx='5px'
      />
    </Flex>
  )
}

export default MobileTraverseBar
