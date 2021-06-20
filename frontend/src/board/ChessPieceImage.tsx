import { PieceType } from 'chess.js'
import { FC } from 'react'
import whiteKingSvg from './whiteKing.svg'
import whiteQueenSvg from './whiteQueen.svg'
import whiteRookSvg from './whiteRook.svg'
import whiteKnightSvg from './whiteKnight.svg'
import whiteBishopSvg from './whiteBishop.svg'
import whitePawnSvg from './whitePawn.svg'
import blackKingSvg from './blackKing.svg'
import blackQueenSvg from './blackQueen.svg'
import blackRookSvg from './blackRook.svg'
import blackKnightSvg from './blackKnight.svg'
import blackBishopSvg from './blackBishop.svg'
import blackPawnSvg from './blackPawn.svg'

interface Props {
  type: PieceType
  color: 'w' | 'b'
  size: string
}

const ChessPieceImage: FC<Props> = ({ type, color, size }) => {
  if (color === 'w') {
    if (type === 'k') {
      return <div style={{ backgroundImage: `url(${whiteKingSvg})`, backgroundSize: size, width: size, height: size }} />
    }
    if (type === 'q') {
      return <div style={{ backgroundImage: `url(${whiteQueenSvg})`, backgroundSize: size, width: size, height: size }} />
    }
    if (type === 'r') {
      return <div style={{ backgroundImage: `url(${whiteRookSvg})`, backgroundSize: size, width: size, height: size }} />
    }
    if (type === 'n') {
      return <div style={{ backgroundImage: `url(${whiteKnightSvg})`, backgroundSize: size, width: size, height: size }} />
    }
    if (type === 'b') {
      return <div style={{ backgroundImage: `url(${whiteBishopSvg})`, backgroundSize: size, width: size, height: size }} />
    }
    return <div style={{ backgroundImage: `url(${whitePawnSvg})`, backgroundSize: size, width: size, height: size }} />
  }
  if (type === 'k') {
    return <div style={{ backgroundImage: `url(${blackKingSvg})`, backgroundSize: size, width: size, height: size }} />
  }
  if (type === 'q') {
    return <div style={{ backgroundImage: `url(${blackQueenSvg})`, backgroundSize: size, width: size, height: size }} />
  }
  if (type === 'r') {
    return <div style={{ backgroundImage: `url(${blackRookSvg})`, backgroundSize: size, width: size, height: size }} />
  }
  if (type === 'n') {
    return <div style={{ backgroundImage: `url(${blackKnightSvg})`, backgroundSize: size, width: size, height: size }} />
  }
  if (type === 'b') {
    return <div style={{ backgroundImage: `url(${blackBishopSvg})`, backgroundSize: size, width: size, height: size }} />
  }
  return <div style={{ backgroundImage: `url(${blackPawnSvg})`, backgroundSize: size, width: size, height: size }} />
}

export default ChessPieceImage
