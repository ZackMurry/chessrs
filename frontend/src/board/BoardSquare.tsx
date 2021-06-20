import { ChessInstance, Move, PieceType, Square } from 'chess.js'
import { FC, useMemo } from 'react'
import { useDrop } from 'react-dnd'
import ChessPiece from './ChessPiece'
import squareIndexToCoordinates from './squareIndexToCoordinates'

interface Props {
  x: number
  y: number
  piece?: PieceType
  pieceColor?: 'w' | 'b'
  game: ChessInstance
  onMovedTo: () => void
}

interface PlacedPiece {
  position: string
  type: PieceType
  color: 'w' | 'b'
}

const BoardSquare: FC<Props> = ({ x, y, piece, pieceColor, game, onMovedTo }) => {
  const [{ canDrop }, drop] = useDrop(
    () => ({
      accept: ['k', 'q', 'r', 'n', 'b', 'p', 'K', 'Q', 'R', 'N', 'B', 'P'],
      canDrop: (item: PlacedPiece) => {
        const isMoveMatching = (move: Move) => {
          if (move.from === item.position && move.piece === item.type && move.color === item.color && move.to === position) {
            return true
          }
          // Check using startsWith() because it could be O-O-O# or something
          if (move.san.startsWith('O-O-O')) {
            if (move.color === 'w' && position === 'c1') {
              return true
            } else if (move.color === 'b' && position === 'c8') {
              return true
            }
          } else if (move.san.startsWith('O-O')) {
            if (move.color === 'w' && position === 'g1') {
              return true
            } else if (move.color === 'b' && position === 'g8') {
              return true
            }
          }
          return false
        }
        const canDrop = game.moves({ verbose: true }).filter(isMoveMatching).length !== 0
        return canDrop
      },
      drop: (item: PlacedPiece) => {
        game.move({
          from: item.position as Square,
          to: position as Square
        })
        onMovedTo()
      },
      collect: monitor => ({
        canDrop: monitor.canDrop()
      })
    }),
    []
  )
  const position = useMemo(() => squareIndexToCoordinates(x, y), [x, y])
  const squareColor = (x + y) % 2 === 1 ? '#f0d9b5' : '#b58863'
  return (
    <div
      style={{
        backgroundColor: squareColor,
        width: 100,
        height: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      ref={drop}
    >
      {canDrop && (
        <div
          style={{
            background: 'radial-gradient(rgba(20,85,30,0.5) 19%, rgba(0,0,0,0) 20%)',
            width: '100%',
            height: '100%',
            borderRadius: '50%'
          }}
        />
      )}
      {piece && pieceColor && <ChessPiece type={piece} color={pieceColor} size='90px' position={position} game={game} />}
    </div>
  )
}

export default BoardSquare
