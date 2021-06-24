import appendMoveToPgn from './appendMoveToPgn'

test('appends move by black', () => {
  expect(appendMoveToPgn('1. e4', 'e5', 1)).toBe('1. e4 e5')
  expect(appendMoveToPgn('1. d4 d5 2. c4', 'e6', 3)).toBe('1. d4 d5 2. c4 e6')
  expect(appendMoveToPgn('1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. g3', 'Be7', 7)).toBe('1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. g3 Be7')
})

test('appends move by white', () => {
  expect(appendMoveToPgn('', 'e4', 0)).toBe('1. e4')
  expect(appendMoveToPgn('1. e4 e5', 'Nf3', 2)).toBe('1. e4 e5 2. Nf3')
  expect(appendMoveToPgn('1. d4 d5 2. c4 e6 3. Nf3 Nf6', 'g3', 6)).toBe('1. d4 d5 2. c4 e6 3. Nf3 Nf6 4. g3')
})
