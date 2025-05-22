import { PieceType } from 'chess.js'
import whiteKingSvg from 'assets/whiteKing.svg'
import whiteQueenSvg from 'assets/whiteQueen.svg'
import whiteRookSvg from 'assets/whiteRook.svg'
import whiteKnightSvg from 'assets/whiteKnight.svg'
import whiteBishopSvg from 'assets/whiteBishop.svg'
import whitePawnSvg from 'assets/whitePawn.svg'
import blackKingSvg from 'assets/blackKing.svg'
import blackQueenSvg from 'assets/blackQueen.svg'
import blackRookSvg from 'assets/blackRook.svg'
import blackKnightSvg from 'assets/blackKnight.svg'

const getPieceNameByPiece = (type: PieceType, color: 'w' | 'b') => {
  if (color === 'w') {
    if (type === 'k') {
      return 'whiteKing'
    }
    if (type === 'q') {
      return 'whiteQueen'
    }
    if (type === 'r') {
      return 'whiteRook'
    }
    if (type === 'n') {
      return 'whiteKnight'
    }
    if (type === 'b') {
      return 'whiteBishop'
    }
    return 'whitePawn'
  }
  if (type === 'k') {
    return 'blackKing'
  }
  if (type === 'q') {
    return 'blackQueen'
  }
  if (type === 'r') {
    return 'blackRook'
  }
  if (type === 'n') {
    return 'blackKnight'
  }
  if (type === 'b') {
    return 'blackBishop'
  }
  return 'blackPawn'
}

const getImageByPiece = (type: PieceType, color: 'w' | 'b') =>
  `/pieces/${getPieceNameByPiece(type, color)}.svg`

export default getImageByPiece
