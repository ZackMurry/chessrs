import { FC, useMemo } from 'react'
import { Box } from '@chakra-ui/react'

interface Props {
  pgn: string
  halfMoveCount: number
}

const PGNDisplay: FC<Props> = ({ pgn, halfMoveCount }) => {
  // todo: can I use moveHistory here?
  const moves = useMemo(
    () =>
      pgn
        .split(/\d\. /)
        .slice(1)
        .map((move) => move.split(' '))
        .map(([white, black]) => ({ white, black })),
    [pgn],
  )
  // console.log(pgn)
  // console.log(moves)

  return (
    <Box h='40vh' overflowY='auto'>
      {/* todo: click on move to jump */}
      <h3 className='text-xl font-bold text-offwhite mt-4'>
        {moves.map(({ white, black }, idx) => (
          <span key={`${white}-${black}-${idx}`}>
            {idx + 1}.{' '}
            <span
              className={
                halfMoveCount === idx * 2 + 1 ? 'bg-[#fde04740]' : undefined
              }
            >
              {white}
            </span>{' '}
            <span
              className={
                halfMoveCount === idx * 2 + 2 ? 'bg-[#fde04740]' : undefined
              }
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
