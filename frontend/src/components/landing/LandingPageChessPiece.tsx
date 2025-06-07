import { ChessInstance, PieceType } from 'chess.js'
import React, { FC, useMemo } from 'react'
import getImageByPiece from 'components/board/getImageByPiece'

interface Props {
  type: PieceType
  color: 'w' | 'b'
  size: string
  position: string
  game: ChessInstance
  onDragStart: () => void
  minSize: string
}

const LandingPageChessPiece: FC<Props> = ({ type, color, size, position, game, onDragStart, minSize }) => {
  const imageUrl = useMemo(() => getImageByPiece(type, color), [type, color])

  return (
    <div
      // @ts-ignore next-line
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'translate(0,0)'
      }}
      onDragStart={onDragStart}
    >
      <div
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: size,
          width: size,
          height: size,
          minWidth: minSize,
          minHeight: minSize
        }}
      />
    </div>
  )
}

export default LandingPageChessPiece
