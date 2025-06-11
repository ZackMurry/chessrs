import { Flex, IconButton } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { FC } from 'react'
import { traverseBackwards, traverseForwards, traverseToEnd, traverseToStart } from 'store/boardSlice'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import DarkTooltip from './DarkTooltip'

const MobileTraverseBar: FC = () => {
  const dispatch = useAppDispatch()
  const { halfMoveCount, historySize } = useAppSelector(state => ({
    halfMoveCount: state.board.halfMoveCount,
    historySize: state.board.moveHistory.length
  }))

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
      <DarkTooltip label='Start (s)'>
        <IconButton
          icon={<ChevronsLeft />}
          aria-label='Start'
          onClick={() => dispatch(traverseToStart())}
          disabled={halfMoveCount <= 0}
          className='text-black'
        />
      </DarkTooltip>
      <DarkTooltip label='Back (←)'>
        <IconButton
          icon={<ChevronLeft />}
          aria-label='Back'
          onClick={() => dispatch(traverseBackwards())}
          disabled={halfMoveCount <= 0}
          fontSize='4xl'
          className='text-black'
        />
      </DarkTooltip>
      <DarkTooltip label='Forward (→)'>
        <IconButton
          icon={<ChevronRight />}
          aria-label='Forward'
          onClick={() => dispatch(traverseForwards())}
          disabled={halfMoveCount >= historySize}
          fontSize='4xl'
          className='text-black'
        />
      </DarkTooltip>
      <DarkTooltip label='End (e)'>
        <IconButton
          icon={<ChevronsRight />}
          aria-label='End'
          onClick={() => dispatch(traverseToEnd())}
          disabled={halfMoveCount >= historySize}
          className='text-black'
        />
      </DarkTooltip>
    </Flex>
  )
}

export default MobileTraverseBar
