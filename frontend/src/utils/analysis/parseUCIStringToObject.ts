const parseUCIStringToObject = (s: string, numTokens: number): Object => {
  const o = {}
  const tokens = s.split(' ')
  for (let i = 0; i < numTokens; i += 2) {
    if (tokens[i] === 'score' || tokens[i] === 'lowerbound' || tokens[i] === 'upperbound') {
      i--
      continue
    }
    const parsed = Number.parseFloat(tokens[i + 1])
    o[tokens[i]] = Number.isNaN(parsed) ? tokens[i + 1] : parsed
  }
  return o
}

export default parseUCIStringToObject
