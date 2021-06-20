import { FC, useEffect, useState } from 'react'
import ChessJS, { PieceType, Square } from 'chess.js'
import BoardSquare from './BoardSquare'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const chess = new Chess()

export interface SelectedPiece {
  position: string
  type: PieceType
}

const Chessboard: FC = () => {
  const [fen, setFen] = useState(() => chess.fen())
  const [selectedPiece, setSelectedPiece] = useState<SelectedPiece | null>(null)

  const handleSquareClick = (position: string, type?: PieceType, color?: 'b' | 'w') => {
    if (selectedPiece) {
      chess.move({
        from: selectedPiece.position as Square,
        to: position as Square
      })
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

  return (
    <div>
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
              onMovedTo={() => setFen(chess.fen())}
              onClick={position => handleSquareClick(position, square?.type, square?.color)}
              selectedPiece={selectedPiece}
              onPieceDrag={() => setSelectedPiece(null)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Chessboard
