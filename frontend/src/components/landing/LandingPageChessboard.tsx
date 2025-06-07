import { FC, useEffect, useState } from 'react'
import ChessJS from 'chess.js'
import { Flex } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { useAppSelector } from 'utils/hooks'
import LandingPageBoardSquare from './LandingPageBoardSquare'
import { STARTING_FEN } from 'store/boardSlice'

interface Props {}

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const LandingPageChessboard: FC<Props> = () => {
  //   const squareLength = useBreakpointValue({
  //     base: 11.5,
  //     md: 10,
  //     lg: 8,
  //     xl: 6,
  //     '2xl': 5.2
  //   })
  const [chess, setChess] = useState(() => new Chess())
  const squareLength = 3

  useEffect(() => {
    setChess(new Chess('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'))
  }, [])

  return (
    <Flex w='100%' h='100%' justifyContent='center' alignItems='center' flexDir={'column'}>
      {chess.board().map((row, i) => (
        <Flex flexDir={'row'} key={`board-row-${i}`}>
          {row.map((square, j) => (
            <LandingPageBoardSquare
              x={j}
              y={7 - i}
              piece={square?.type}
              pieceColor={square?.color}
              key={`square@(${j},${7 - i})`}
              game={chess}
              size={squareLength}
            />
          ))}
        </Flex>
      ))}
    </Flex>
  )
}

export default LandingPageChessboard
