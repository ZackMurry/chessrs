import { ChessInstance, PieceType } from 'chess.js'
import { FC, useMemo } from 'react'
import squareIndexToCoordinates from 'components/board/squareIndexToCoordinates'
import { useAppDispatch } from 'utils/hooks'
import { unselectPiece } from 'store/boardSlice'
import LandingPageChessPiece from './LandingPageChessPiece'

interface Props {
  x: number
  y: number
  piece?: PieceType
  pieceColor?: 'w' | 'b'
  game: ChessInstance
  size: number
  lastMove: string
}

// const squareLength = 5
const MIN_SQUARE_LENGTH = 20

const LandingPageBoardSquare: FC<Props> = ({ x, y, piece, pieceColor, game, size, lastMove }) => {
  const dispatch = useAppDispatch()
  const squarePosition = useMemo(() => squareIndexToCoordinates(x, y), [x, y])

  let squareColor: string
  if ((x + y) % 2 === 1) {
    // Light square
    if (lastMove.length && (lastMove.substring(0, 2) === squarePosition || lastMove.substring(2, 4) === squarePosition)) {
      // Highlighted
      squareColor = '#ced26b'
    } else {
      squareColor = '#f0d9b5'
    }
  } else {
    // Dark square
    if (lastMove.length && (lastMove.substring(0, 2) === squarePosition || lastMove.substring(2, 4) === squarePosition)) {
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
