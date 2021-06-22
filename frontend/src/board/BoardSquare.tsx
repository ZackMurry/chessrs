import { ChessInstance, Move, PieceType, Square } from 'chess.js'
import { FC, useEffect, useMemo, useState } from 'react'
import { useDrop } from 'react-dnd'
import { ShortMove } from 'chess.js'
import { SelectedPiece } from './Chessboard'
import ChessPiece from './ChessPiece'
import squareIndexToCoordinates from './squareIndexToCoordinates'

const isMoveMatching = (move: Move, position: string, pieceType: PieceType, origin: string) => {
  if (move.from === origin && move.piece === pieceType && move.to === position) {
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

interface Props {
  x: number
  y: number
  piece?: PieceType
  pieceColor?: 'w' | 'b'
  game: ChessInstance
  onMovedTo: (move: ShortMove) => void
  onClick: (position: string) => void
  selectedPiece: SelectedPiece
  onPieceDrag: () => void
  size: number
}

interface PlacedPiece {
  position: string
  type: PieceType
  color: 'w' | 'b'
}

// const squareLength = 5
const MIN_SQUARE_LENGTH = 20

const BoardSquare: FC<Props> = ({ x, y, piece, pieceColor, game, onMovedTo, onClick, selectedPiece, onPieceDrag, size }) => {
  const position = useMemo(() => squareIndexToCoordinates(x, y), [x, y])
  const [canSelectedPieceMove, setCanSelectedPieceMove] = useState(false)
  const [{ canDrop }, drop] = useDrop(
    () => ({
      accept: ['k', 'q', 'r', 'n', 'b', 'p', 'K', 'Q', 'R', 'N', 'B', 'P'],
      canDrop: (item: PlacedPiece) => {
        return (
          game.moves({ verbose: true }).filter(move => isMoveMatching(move, position, item.type, item.position)).length !== 0
        )
      },
      drop: (item: PlacedPiece) => {
        const move = {
          from: item.position as Square,
          to: position as Square
        }
        onMovedTo(move)
      },
      collect: monitor => ({
        canDrop: monitor.canDrop()
      })
    }),
    [game]
  )
  const squareColor = (x + y) % 2 === 1 ? '#f0d9b5' : '#b58863'
  const handleClick = () => {
    onClick(position)
  }

  useEffect(() => {
    if (selectedPiece) {
      setCanSelectedPieceMove(
        game
          .moves({ verbose: true })
          .filter(move => isMoveMatching(move, position, selectedPiece.type, selectedPiece.position)).length !== 0
      )
    } else {
      setCanSelectedPieceMove(false)
    }
  }, [selectedPiece, game, position])

  const showValidMoveIndicator = canDrop || canSelectedPieceMove

  return (
    <div
      style={{
        backgroundColor: squareColor,
        width: `${size}vw`,
        height: `${size}vw`
      }}
      ref={drop}
      onClick={handleClick}
    >
      {showValidMoveIndicator && (
        <div
          style={{
            background: piece
              ? 'radial-gradient(transparent 0%, transparent 79%, rgba(20,85,0,0.3) 80%)'
              : 'radial-gradient(rgba(20,85,30,0.5) 19%, rgba(0,0,0,0) 20%)',
            width: `${size}vw`,
            height: `${size}vw`,
            minWidth: MIN_SQUARE_LENGTH,
            minHeight: MIN_SQUARE_LENGTH,
            borderRadius: piece ? undefined : '50%',
            position: 'static',
            left: 0,
            top: 0,
            // transform: 'translate(-50%, -50%)',
            zIndex: 0
          }}
        />
      )}
      {piece && pieceColor && (
        <div style={{ marginTop: showValidMoveIndicator ? '-100%' : undefined }}>
          <ChessPiece
            type={piece}
            color={pieceColor}
            size={`${(9 * size) / 10}vw`}
            minSize={`${(9 * MIN_SQUARE_LENGTH) / 10}px`}
            position={position}
            game={game}
            onDragStart={onPieceDrag}
          />
        </div>
      )}
    </div>
  )
}

export default BoardSquare
