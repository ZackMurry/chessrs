import { ChessInstance, Move, PieceType } from 'chess.js'
import { FC, useEffect, useMemo, useState } from 'react'
import { useDrop } from 'react-dnd'
import ChessPiece from './ChessPiece'
import squareIndexToCoordinates from './squareIndexToCoordinates'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import { makeMove, selectPiece, unselectPiece } from 'store/boardSlice'

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

const BoardSquare: FC<Props> = ({ x, y, piece, pieceColor, game, size }) => {
  const dispatch = useAppDispatch()
  const squarePosition = useMemo(() => squareIndexToCoordinates(x, y), [x, y])
  const { selectedPiece, lastMoveUCI, boardEnabled } = useAppSelector(state => ({
    selectedPiece: state.board.selectedPiece,
    lastMoveUCI: state.board.halfMoveCount > 0 ? state.board.moveHistory[state.board.halfMoveCount - 1].uci : '',
    boardEnabled: state.board.enabled
  }))
  const [canSelectedPieceMove, setCanSelectedPieceMove] = useState(false)

  const [{ canDrop }, drop] = useDrop(
    () => ({
      accept: ['k', 'q', 'r', 'n', 'b', 'p', 'K', 'Q', 'R', 'N', 'B', 'P'],
      canDrop: (item: PlacedPiece) => {
        return (
          game.moves({ verbose: true }).filter(move => isMoveMatching(move, squarePosition, item.position)).length !== 0 &&
          boardEnabled
        )
      },
      drop: (item: PlacedPiece) => {
        const strMove = `${item.position}${squarePosition}`
        dispatch(makeMove(strMove))
      },
      collect: monitor => ({
        canDrop: monitor.canDrop()
      })
    }),
    [game]
  )
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
  const handleClick = () => {
    if (!boardEnabled) {
      return
    }
    console.log('selected square')
    console.log(game.fen())
    if (selectedPiece !== null) {
      if (selectedPiece.position === squarePosition) {
        dispatch(unselectPiece())
        return
      }
      let move = `${selectedPiece.position}${squarePosition}`
      // Adjust for clicking on the king then the rook to castle
      if (selectedPiece.type === 'k') {
        if (selectedPiece.position === 'e1') {
          if (squarePosition === 'a1') {
            move = `${selectedPiece.position}c1`
          } else if (squarePosition === 'h1') {
            move = `${selectedPiece.position}g1`
          }
        } else if (selectedPiece.position === 'e8') {
          if (squarePosition === 'a8') {
            move = `${selectedPiece.position}c8`
          } else if (squarePosition === 'h8') {
            move = `${selectedPiece.position}g8`
          }
        }
      }
      if (
        game.moves({ verbose: true }).filter(move => isMoveMatching(move, squarePosition, selectedPiece.position)).length !==
        0
      ) {
        dispatch(makeMove(move))
        dispatch(unselectPiece())
      } else {
        dispatch(selectPiece({ position: squarePosition, type: piece }))
      }
    } else if (piece) {
      console.log('selected piece')
      dispatch(selectPiece({ position: squarePosition, type: piece }))
    } else {
      dispatch(unselectPiece())
    }
  }

  useEffect(() => {
    if (selectedPiece !== null) {
      setCanSelectedPieceMove(
        game.moves({ verbose: true }).filter(move => isMoveMatching(move, squarePosition, selectedPiece.position)).length !==
          0
      )
    } else {
      setCanSelectedPieceMove(false)
    }
  }, [selectedPiece, game, squarePosition])

  const showValidMoveIndicator = canDrop || canSelectedPieceMove

  return (
    <div
      style={{
        backgroundColor: squareColor,
        width: `${size}vw`,
        height: `${size}vw`
      }}
      // @ts-ignore next-line
      ref={drop}
      onClick={handleClick}
      draggable={false}
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
            position={squarePosition}
            game={game}
            onDragStart={() => dispatch(unselectPiece())}
          />
        </div>
      )}
    </div>
  )
}

export default BoardSquare
