// todo unit tests
const getFirstMovesOfPgn = (currentPgn: string, numHalfMoves: number) => {
  let numCharsInSubstring = 0
  for (let i = 0; i < numHalfMoves; i++) {
    if (i !== 0) {
      numCharsInSubstring++
    }
    if (i % 2 === 0) {
      numCharsInSubstring += 3
    }
    // Continue until a space or the end of the string
    while (numCharsInSubstring < currentPgn.length && currentPgn.charAt(numCharsInSubstring) !== ' ') {
      numCharsInSubstring++
    }
  }
  return currentPgn.substring(0, numCharsInSubstring)
}

export default getFirstMovesOfPgn
