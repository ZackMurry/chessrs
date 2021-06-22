import { FC, useEffect, useState } from 'react'
import ChessJS, { PieceType, Square } from 'chess.js'
import BoardSquare from './BoardSquare'
import { Flex } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const chess = new Chess()

export interface SelectedPiece {
  position: string
  type: PieceType
}

interface Props {
  onMove: (move: ChessJS.ShortMove, pgn: string) => void
}

// todo indicator to show where the last move was from/to. this also removes the need for the fen state
const Chessboard: FC<Props> = ({ onMove }) => {
  const squareLength = useBreakpointValue({ base: 12, md: 9, xl: 4 })
  const [fen, setFen] = useState(() => chess.fen())
  const [selectedPiece, setSelectedPiece] = useState<SelectedPiece | null>(null)

  const handleSquareClick = (position: string, type?: PieceType, color?: 'b' | 'w') => {
    if (selectedPiece) {
      const move = {
        from: selectedPiece.position as Square,
        to: position as Square
      }
      chess.move(move)
      onMove(move, chess.pgn())
      setSelectedPiece(null)
    } else if (type) {
      setSelectedPiece({
        type,
        position
      })
    } else {
      setSelectedPiece(null)
    }
    setFen(chess.fen())
  }

  const handleDragMove = (move: ChessJS.ShortMove) => {
    setFen(chess.fen())
    onMove(move, chess.pgn())
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
              key={`${square?.type}@(${j},${7 - i})`}
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
