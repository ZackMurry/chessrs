import { ChessInstance, Move, PieceType } from 'chess.js'
import { FC, useEffect, useMemo, useState } from 'react'
import { useDrop } from 'react-dnd'
import ChessPiece from './LandingPageChessPiece'
import squareIndexToCoordinates from 'components/board/squareIndexToCoordinates'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import { makeMove, selectPiece, unselectPiece } from 'store/boardSlice'
import LandingPageChessPiece from './LandingPageChessPiece'

const isMoveMatching = (move: Move, position: string, origin: string) => {
  if (move.from === origin && move.to === position) {
    return true
  }
  // Check using startsWith() because it could be O-O-O# or something
  if (move.san.startsWith('O-O-O')) {
    if (move.color === 'w' && (position === 'c1' || position === 'a1') && origin === 'e1') {
      return true
    } else if (move.color === 'b' && (position === 'c8' || position === 'a8') && origin === 'e8') {
      return true
    }
  } else if (move.san.startsWith('O-O')) {
    if (move.color === 'w' && (position === 'g1' || position === 'h1') && origin === 'e1') {
      return true
    } else if (move.color === 'b' && (position === 'g8' || position === 'h8') && origin === 'e8') {
      return true
    }
  }
  return false
}

interface Props {
  x: number
  y: number
  piece?: PieceType
  pieceColor?: 'w' | 'b'
  game: ChessInstance
  size: number
}

interface PlacedPiece {
  position: string
  type: PieceType
  color: 'w' | 'b'
}

// const squareLength = 5
const MIN_SQUARE_LENGTH = 20

const LandingPageBoardSquare: FC<Props> = ({ x, y, piece, pieceColor, game, size }) => {
  const dispatch = useAppDispatch()
  const squarePosition = useMemo(() => squareIndexToCoordinates(x, y), [x, y])
  const lastMoveUCI = 'e2e4'

  let squareColor: string
  if ((x + y) % 2 === 1) {
    // Light square
    if (
      lastMoveUCI.length &&
      (lastMoveUCI.substring(0, 2) === squarePosition || lastMoveUCI.substring(2, 4) === squarePosition)
    ) {
      // Highlighted
      squareColor = '#ced26b'
    } else {
      squareColor = '#f0d9b5'
    }
  } else {
    // Dark square
    if (
      lastMoveUCI.length &&
      (lastMoveUCI.substring(0, 2) === squarePosition || lastMoveUCI.substring(2, 4) === squarePosition)
    ) {
      // Highlighted
      squareColor = '#aba23a'
    } else {
      squareColor = '#b58863'
    }
  }

  return (
    <div
      style={{
        backgroundColor: squareColor,
        width: `${size}vw`,
        height: `${size}vw`
      }}
      // @ts-ignore next-line
      draggable={false}
    >
      {piece && pieceColor && (
        <div>
          <LandingPageChessPiece
            type={piece}
            color={pieceColor}
            size={`${(9 * size) / 10}vw`}
            minSize={`${(9 * MIN_SQUARE_LENGTH) / 10}px`}
            position={squarePosition}
            game={game}
            onDragStart={() => dispatch(unselectPiece())}
          />
        </div>
      )}
    </div>
  )
}

export default LandingPageBoardSquare
