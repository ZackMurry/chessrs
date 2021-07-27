import { FC, useEffect, useState } from 'react'
import ChessJS from 'chess.js'
import BoardSquare from './BoardSquare'
import { Flex } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { useAppSelector } from '../hooks'

interface Props {}

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

// todo indicator to show where the last move was from/to
// todo: clicking off board should unselect the currently selected piece
const Chessboard: FC<Props> = () => {
  const squareLength = useBreakpointValue({ base: 12, md: 9, xl: 5.2 })
  const [chess, setChess] = useState(() => new Chess())
  const position = useAppSelector(state => state.board.fen)

  useEffect(() => {
    setChess(new Chess(position))
  }, [position])

  return (
    <Flex w='100%' h='100%' justifyContent='center' alignItems='center' flexDir='column'>
      {chess.board().map((row, i) => (
        <div style={{ display: 'flex' }} key={`board-row-${i}`}>
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
        </div>
      ))}
    </Flex>
  )
}

export default Chessboard
