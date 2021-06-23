const appendMoveToPgn = (currentPgn: string, move: string, halfMovesPlayed: number) => {
  const isPlayedByWhite = halfMovesPlayed % 2 === 0
  return currentPgn + (halfMovesPlayed === 0 ? '' : ' ') + (isPlayedByWhite ? `${halfMovesPlayed / 2 + 1}. ` : '') + move
}

export default appendMoveToPgn
