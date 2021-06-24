import { PieceType } from 'chess.js'
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

const getImageByPiece = (type: PieceType, color: 'w' | 'b') => {
  if (color === 'w') {
    if (type === 'k') {
      return whiteKingSvg
    }
    if (type === 'q') {
      return whiteQueenSvg
    }
    if (type === 'r') {
      return whiteRookSvg
    }
    if (type === 'n') {
      return whiteKnightSvg
    }
    if (type === 'b') {
      return whiteBishopSvg
    }
    return whitePawnSvg
  }
  if (type === 'k') {
    return blackKingSvg
  }
  if (type === 'q') {
    return blackQueenSvg
  }
  if (type === 'r') {
    return blackRookSvg
  }
  if (type === 'n') {
    return blackKnightSvg
  }
  if (type === 'b') {
    return blackBishopSvg
  }
  return blackPawnSvg
}

export default getImageByPiece
