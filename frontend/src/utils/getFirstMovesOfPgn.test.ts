import getFirstMovesOfPgn from './getFirstMovesOfPgn'

test('gets the first move from a pgn', () => {
  expect(getFirstMovesOfPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6', 1)).toBe('1. e4')
  expect(getFirstMovesOfPgn('1. d4 d5 2. c4 e6', 1)).toBe('1. d4')
})

test('gets the first few moves from a pgn', () => {
  expect(getFirstMovesOfPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6', 5)).toBe('1. e4 e5 2. Nf3 Nc6 3. Bb5')
  expect(getFirstMovesOfPgn('1. d4 d5 2. c4 e6', 3)).toBe('1. d4 d5 2. c4')
})

test('gets all of the moves of a pgn', () => {
  expect(getFirstMovesOfPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6', 6)).toBe('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6')
  expect(getFirstMovesOfPgn('1. d4 d5 2. c4 e6', 4)).toBe('1. d4 d5 2. c4 e6')
})

test('gets the first 0 moves of a pgn', () => {
  expect(getFirstMovesOfPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6', 0)).toBe('')
  expect(getFirstMovesOfPgn('1. d4 d5 2. c4 e6', 0)).toBe('')
})
