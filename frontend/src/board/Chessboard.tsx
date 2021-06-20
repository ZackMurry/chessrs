import { FC, useEffect, useState } from 'react'
import ChessJS from 'chess.js'
import BoardSquare from './BoardSquare'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const chess = new Chess()

// todo: point and click instead of dragging as an option
const Chessboard: FC = () => {
  const [fen, setFen] = useState(() => chess.fen())
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
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Chessboard
