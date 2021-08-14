import parseUCIStringToObject from './parseUCIStringToObject'
import { InfoObject } from './Stockfish'

test('parses analysis info without bound', () => {
  const result = parseUCIStringToObject(
    'depth 31 seldepth 41 multipv 1 score cp 73 nodes 168986600 nps 1025254 hashfull 999 time 164824 pv e2e4 e7e6 d2d4 d7d5 b1d2 c7c5 g1f3 g8f6 e4e5 f6d7 c2c3 d8b6 f1d3 b8c6 e1g1 c5d4 c3d4 c6d4 f3d4 b6d4 d2f3 d4b6 d1c2 b6c6 c2b1 c6b6 d3h7 b6c7 c1f4 c7b6 f1d1 f8c5 f4g3 c5e7 bmc 0.226817',
    18
  ) as InfoObject
  expect(result.pv).toBeDefined()
  expect(result.pv).toBe('e2e4')
  expect(result.depth).toBe(31)
  expect(result.seldepth).toBe(41)
  expect(result.multipv).toBe(1)
  expect(result.cp).toBe(73)
  expect(result.nodes).toBe(168986600)
  expect(result.nps).toBe(1025254)
  expect(result.time).toBe(164824)
})

test('parses analysis info with bound', () => {
  const result = parseUCIStringToObject(
    'depth 27 seldepth 35 multipv 1 score cp 56 lowerbound nodes 55761063 nps 1058064 hashfull 999 time 52701 pv d2d4 bmc 1.24055',
    19
  ) as InfoObject
  expect(result.pv).toBeDefined()
  expect(result.pv).toBe('d2d4')
  expect(result.depth).toBe(27)
  expect(result.seldepth).toBe(35)
  expect(result.multipv).toBe(1)
  expect(result.cp).toBe(56)
  expect(result.nodes).toBe(55761063)
  expect(result.nps).toBe(1058064)
  expect(result.time).toBe(52701)
})

test('parses mate in ...', () => {
  const result = parseUCIStringToObject(
    'depth 22 seldepth 11 multipv 1 score mate -5 nodes 44209 nps 345382 time 128 pv g2f1 c7h2 c4e3 d5f3 b3b6 a7b6 a6e2 h2e2 f1g1 e2g2 bmc 0',
    16
  ) as InfoObject
  expect(result.mate).toBeDefined()
  expect(result.mate).toBe(-5)
  expect(result.depth).toBe(22)
  expect(result.seldepth).toBe(11)
  expect(result.multipv).toBe(1)
  expect(result.nodes).toBe(44209)
  expect(result.nps).toBe(345382)
  expect(result.time).toBe(128)
})
