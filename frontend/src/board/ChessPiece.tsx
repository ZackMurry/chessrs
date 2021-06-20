import { ChessInstance, PieceType } from 'chess.js'
import { FC, useEffect, useMemo } from 'react'
import { useDrag } from 'react-dnd'
import getImageByPiece from './getImageByPiece'

interface Props {
  type: PieceType
  color: 'w' | 'b'
  size: string
  position: string
  game: ChessInstance
  onDragStart: () => void
}

const ChessPiece: FC<Props> = ({ type, color, size, position, game, onDragStart }) => {
  const imageUrl = useMemo(() => getImageByPiece(type, color), [type, color])
  const [{ isDragging }, drag] = useDrag(
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
    <div
      ref={drag}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onDragStart={onDragStart}
    >
      <div style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: size, width: size, height: size }} />
    </div>
  )
}

export default ChessPiece
