export default function getPlyIndexFromFEN(fen: string) {
  const parts = fen.trim().split(/\s+/)
  if (parts.length < 6) {
    throw new Error('Invalid FEN: not enough fields')
  }

  const sideToMove = parts[1] // "w" or "b"
  const fullmoveNumber = parseInt(parts[5], 10)

  if (!['w', 'b'].includes(sideToMove)) {
    throw new Error("Invalid FEN: side to move must be 'w' or 'b'")
  }
  if (isNaN(fullmoveNumber)) {
    throw new Error('Invalid FEN: fullmove number is not a number')
  }

  return (fullmoveNumber - 1) * 2 + (sideToMove === 'w' ? 1 : 2)
}
