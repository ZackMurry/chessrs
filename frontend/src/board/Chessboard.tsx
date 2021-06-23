import { FC, useEffect, useState } from 'react'
import ChessJS, { PieceType, Square } from 'chess.js'
import BoardSquare from './BoardSquare'
import { Flex } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'

export interface SelectedPiece {
  position: string
  type: PieceType
}

interface Props {
  onMove: (move: ChessJS.ShortMove) => void
  fen: string
}

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

// todo indicator to show where the last move was from/to
const Chessboard: FC<Props> = ({ onMove, fen }) => {
  const squareLength = useBreakpointValue({ base: 12, md: 9, xl: 4 })
  const [selectedPiece, setSelectedPiece] = useState<SelectedPiece | null>(null)
  const [chess, setChess] = useState(() => new Chess())

  useEffect(() => {
    setChess(new Chess(fen))
  }, [fen])

  const handleSquareClick = (position: string, type?: PieceType, color?: 'b' | 'w') => {
    if (selectedPiece) {
      const move = {
        from: selectedPiece.position as Square,
        to: position as Square
      }
      onMove(move)
      setSelectedPiece(null)
    } else if (type) {
      setSelectedPiece({
        type,
        position
      })
    } else {
      setSelectedPiece(null)
    }
  }

  const handleDragMove = (move: ChessJS.ShortMove) => {
    console.log('drag move')
    // setTimeout(() => onMove(move), 0)
    onMove(move)
  }

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
              onMovedTo={handleDragMove}
              onClick={position => handleSquareClick(position, square?.type, square?.color)}
              selectedPiece={selectedPiece}
              onPieceDrag={() => setSelectedPiece(null)}
              size={squareLength}
            />
          ))}
        </div>
      ))}
    </Flex>
  )
}

export default Chessboard
