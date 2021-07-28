import { FC, useEffect, useState } from 'react'
import ChessJS from 'chess.js'
import BoardSquare from './BoardSquare'
import { Flex } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { useAppSelector } from 'utils/hooks'

interface Props {}

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

// todo indicator to show where the last move was from/to
// todo: clicking off board should unselect the currently selected piece
const Chessboard: FC<Props> = () => {
  const squareLength = useBreakpointValue({ base: 12, md: 9, xl: 5.2 })
  const [chess, setChess] = useState(() => new Chess())
  const { fen, perspective } = useAppSelector(state => ({ fen: state.board.fen, perspective: state.board.perspective }))

  useEffect(() => {
    setChess(new Chess(fen))
  }, [fen])

  return (
    <Flex
      w='100%'
      h='100%'
      justifyContent='center'
      alignItems='center'
      flexDir={`column${perspective === 'black' ? '-reverse' : ''}`}
    >
      {chess.board().map((row, i) => (
        <Flex flexDir={perspective === 'white' ? 'row' : 'row-reverse'} key={`board-row-${i}`}>
          {row.map((square, j) => (
            <BoardSquare
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

export default Chessboard
