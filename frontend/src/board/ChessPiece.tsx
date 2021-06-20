import { ChessInstance, PieceType } from 'chess.js'
import { FC } from 'react'
import { useDrag } from 'react-dnd'
import ChessPieceImage from './ChessPieceImage'

interface Props {
  type: PieceType
  color: 'w' | 'b'
  size: string
  position: string
  game: ChessInstance
}

const ChessPiece: FC<Props> = ({ type, color, size, position, game }) => {
  const [, drag] = useDrag(
    () => ({
      type: color === 'w' ? type.toUpperCase() : type,
      collect: monitor => ({
        isDragging: !!monitor.isDragging()
      }),
      item: {
        position,
        color,
        type
      },
      canDrag: () => {
        return (color === 'w') !== (game.turn() === 'b')
      }
    }),
    []
  )

  return (
    <div ref={drag} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <ChessPieceImage color={color} type={type} size={size} />
    </div>
  )
}

export default ChessPiece
