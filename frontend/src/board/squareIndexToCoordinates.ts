const squareIndexToCoordinates = (x: number, y: number): string => {
  if (x > 7 || y > 7 || x < 0 || y < 0) {
    throw new Error(`Error convering (${x}, ${y}) to coordinates: index out of bounds`)
  }
  let file = 'a'
  if (x === 1) {
    file = 'b'
  } else if (x === 2) {
    file = 'c'
  } else if (x === 3) {
    file = 'd'
  } else if (x === 4) {
    file = 'e'
  } else if (x === 5) {
    file = 'f'
  } else if (x === 6) {
    file = 'g'
  } else if (x === 7) {
    file = 'h'
  }
  return `${file}${y + 1}`
}

export default squareIndexToCoordinates
