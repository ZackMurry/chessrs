import { FC, useMemo } from 'react'
import ChessJS, { Square } from 'chess.js'
import { Flex } from '@chakra-ui/layout'
import LandingPageBoardSquare from './LandingPageBoardSquare'
import { STARTING_FEN } from 'store/boardSlice'
import { useBreakpointValue } from '@chakra-ui/react'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const moves = [
  'e2e4',
  'e7e5',
  'g1f3',
  'b8c6',
  'f1b5',
  'g8f6',
  'e1g1',
  'f6e4',
  'd2d4',
  'e4d6',
  'b5c6',
  'd7c6',
  'd4e5',
  'd6f5',
  'd1d8',
  'e8d8'
]

export interface DemoEval {
  eval: number
  move: string
  depth: number
  name?: string
  moves?: string[]
}

const demoEvals = [
  {
    eval: 0.19,
    move: 'c4',
    depth: 65,
    name: 'Starting position',
    moves: ['e4', 'd4', 'Nf3', 'c4', 'e3', 'g3']
  },
  {
    eval: 0.18,
    move: 'e5',
    depth: 70,
    name: "King's Pawn Game",
    moves: ['e5', 'c5', 'd5', 'e6', 'c6', 'd6']
  },
  {
    eval: 0.22,
    move: 'Nf3',
    depth: 65,
    moves: ['Nf3', 'Bc4', 'Nc3', 'd4', 'f4', 'd3']
  },
  {
    eval: 0.13,
    move: 'Nc6',
    depth: 63,
    name: "King's Knight Opening",
    moves: ['Nc6', 'd6', 'Nf6', 'Bc5', 'Qf6', 'd5']
  },
  {
    eval: 0.21,
    move: 'Bb5',
    depth: 65,
    name: "King's Knight Opening: Normal Variation",
    moves: ['Bc4', 'Bb5', 'd4', 'Nc3', 'c3', 'd3']
  },
  {
    eval: 0.15,
    move: 'Nf6',
    depth: 65,
    name: 'Ruy Lopez',
    moves: ['a6', 'd6', 'Nf6', 'Bc5', 'Nd4', 'Nge7']
  },
  {
    eval: 0.64,
    move: 'O-O',
    depth: 55,
    name: 'Ruy Lopez: Berlin Defense',
    moves: ['O-O', 'Bxc6', 'd3', 'Nc3', 'd4', 'c3']
  },
  {
    eval: 0.06,
    move: 'Nxe4',
    depth: 60,
    name: 'Ruy Lopez: Berlin Defense',
    moves: ['Nxe4', 'Bc5', 'd6', 'a6', 'Be7', 'Bd6']
  },
  {
    eval: 0.14,
    move: 'Re1',
    depth: 60,
    name: 'Ruy Lopez: Berlin Defense, Rio Gambit Accepted',
    moves: ['Re1', 'd4', 'Bxc6', 'd3', 'Qe2', 'Nxe5']
  },
  {
    eval: 0.14,
    move: 'Nd6',
    depth: 52,
    name: 'Ruy Lopez: Berlin Defense, Rio Gambit Accepted',
    moves: ['Nd6', 'exd4', 'Nxd4', 'Be7', 'd5', 'a6']
  },
  {
    eval: 0.04,
    move: 'Bxc6',
    depth: 54,
    name: "Ruy Lopez: Berlin Defense, l'Hermet Variation",
    moves: ['Bxc6', 'dxe5', 'Ba4', 'Re1', 'Bg5', 'd5']
  },
  {
    eval: 0.07,
    move: 'dxc6',
    depth: 50,
    name: "Ruy Lopez: Berlin Defense, l'Hermet Variation",
    moves: ['dxc6', 'bxc6', 'e4', 'exd4', 'Nb5', 'b6']
  },
  {
    eval: 0.17,
    move: 'dxe5',
    depth: 44,
    name: "Ruy Lopez: Berlin Defense, l'Hermet Variation",
    moves: ['dxe5', 'Nxe5', 'Re1', 'd5', 'Bg5', 'Qe2']
  },
  {
    eval: 0.05,
    move: 'Nf5',
    depth: 55,
    name: "Ruy Lopez: Berlin Defense, l'Hermet Variation",
    moves: ['Nf5', 'Nc4', 'Nb5', 'Ne4', 'Bg4', 'Be7']
  },
  {
    eval: 0.11,
    move: 'Qxd8+',
    depth: 38,
    name: "Ruy Lopez: Berlin Defense, l'Hermet Variation",
    moves: ['Qxd8+', 'Qe2', 'Nc3', 'Bg5', 'Re1', 'Nbd2']
  },
  {
    eval: 0.04,
    move: 'Kxd8',
    depth: 39,
    name: "Ruy Lopez: Berlin Defense, l'Hermet Variation",
    moves: ['Kxd8']
  },
  {
    eval: 0.14,
    move: 'h3',
    depth: 57,
    name: "Ruy Lopez: Berlin Defense, l'Hermet Variation, Berlin Wall Defense",
    moves: ['Nc3', 'Rd1+', 'Bg5+', 'h3', 'b3', 'Bf4']
  }
] as DemoEval[]

interface Props {
  section: number
}

const MobileLandingChessboard: FC<Props> = ({ section }) => {
  const squareLength = useBreakpointValue({
    base: 10,
    sm: 8,
    md: 6,
    lg: 6,
    xl: 6,
    '2xl': 5.2
  })
  // const [chess, setChess] = useState(() => new Chess())

  const moveIndices = [0, 5, 10, 15]
  const moveIdx = moveIndices[section] ?? 15
  console.log('moveIdx', moveIdx)
  const lastMove = moves[moveIdx]
  const engineEval = demoEvals[moveIdx + 1]
  const chess = useMemo(() => {
    const pos = new Chess(STARTING_FEN)
    if (moveIdx < 0) {
      return pos
    }
    let moveIx = 0
    let moveCount = moveIdx
    while (moveCount >= 0) {
      const move = moves[moveIx++]
      if (!move) {
        break
      }
      pos.move({
        from: move.substring(0, 2) as Square,
        to: move.substring(2, 4) as Square
      })
      moveCount--
    }
    return pos
  }, [moveIdx])
  // const squareLength = 3

  return (
    <Flex justifyContent='center' alignItems='center' flexDir={'column'}>
      <div
        className={`p-4 pr-8 bg-surface border-[2px] border-solid border-surfaceBorder rounded-[3px] max-w-[300px] relative -mt-10 top-16 -right-[80px] z-10 ${
          section > 0 ? 'visible' : 'hidden'
        }`}
      >
        <h3 className='text-xl font-bold text-offwhite mb-1'>Analysis</h3>
        <h6 className='text-md text-offwhite mb-1'>Evaluation: {engineEval.eval}</h6>
        <div className='flex justify-start items-center mb-1'>
          <h6 className='text-md text-offwhite min-w-[110px]'>
            Best move: {engineEval.move}
            {/* {analysis.engine === 'BROWSER'
            ? bestMove.loading
              ? '...'
              : bestMove.san
            : engineEval.bestMove} */}
          </h6>
        </div>
        <h6 className='text-md text-offwhite mb-1 flex justify-start items-center'>
          <div className='min-w-[80px]'>Depth: {engineEval.depth}</div>
          <div>
            <img src='lichess-logo-inverted.png' width={18} height={18} className='ml-2' alt='Lichess logo' />
          </div>
        </h6>
      </div>
      {chess.board().map((row, i) => (
        <Flex flexDir={'row'} key={`board-row-${i}`}>
          {row.map((square, j) => (
            <LandingPageBoardSquare
              x={j}
              y={7 - i}
              piece={square?.type}
              pieceColor={square?.color}
              key={`square@(${j},${7 - i})`}
              game={chess}
              size={squareLength}
              lastMove={lastMove}
            />
          ))}
        </Flex>
      ))}
      <Flex className='justify-center items-center w-full mt-10'>
        <div
          className={`p-4 bg-surface border-[2px] border-solid border-surfaceBorder rounded-[3px] w-full ${
            section > 1 ? 'visible' : 'hidden'
          }`}
        >
          <h3 className='text-xl font-bold text-offwhite mb-1'>{engineEval.name}</h3>
          <h5 className='text-offwhite'>
            <span className='font-bold'>Common moves: </span>
            {engineEval.moves && engineEval.moves.join(', ')}
          </h5>
        </div>
      </Flex>
    </Flex>
  )
}

export default MobileLandingChessboard
