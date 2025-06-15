import { useMemo } from 'react'
import { Box } from '@chakra-ui/react'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import { traverseToMove } from 'store/boardSlice'

const PGNDisplay = () => {
  const { pgn, halfMoveCount, startCount, isStudy } = useAppSelector(state => ({
    pgn: state.board.pgn,
    halfMoveCount: state.board.halfMoveCount,
    moveHistory: state.board.moveHistory,
    fen: state.board.fen,
    startCount: state.board.startHalfMoveCount,
    isStudy: state.board.isStudy
  }))
  const dispatch = useAppDispatch()
  const moves = useMemo(
    () =>
      pgn
        .split(/\d\. /)
        .slice(1)
        .map(move => move.split(' '))
        .map(([white, black]) => ({ white, black })),
    [pgn]
  )

  const onJumpToMove = (moveIdx: number) => {
    dispatch(traverseToMove(moveIdx))
  }

  const delta = (startCount - 1) % 2

  return (
    <Box h={isStudy ? '20vh' : '40vh'} overflowY='auto'>
      <h3 className='text-xl font-bold text-offwhite mt-4'>
        {moves.map(({ white, black }, idx) => (
          <span key={`${white}-${black}-${idx}`}>
            {idx + Math.floor(startCount / 2) + 1}.{' '}
            <span
              className={`cursor-pointer ${halfMoveCount + delta === idx * 2 + 1 ? 'bg-[#fde04740]' : undefined}`}
              onClick={() => onJumpToMove(idx * 2)}
            >
              {white}
            </span>{' '}
            <span
              className={`cursor-pointer ${halfMoveCount + delta === idx * 2 + 2 ? 'bg-[#fde04740]' : undefined}`}
              onClick={() => onJumpToMove(idx * 2 + 1)}
            >
              {black ?? ''}
            </span>{' '}
          </span>
        ))}
      </h3>
    </Box>
  )
}

export default PGNDisplay
