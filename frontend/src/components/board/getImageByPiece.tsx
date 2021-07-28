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
import blackBishopSvg from 'assets/blackBishop.svg'
import blackPawnSvg from 'assets/blackPawn.svg'

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
