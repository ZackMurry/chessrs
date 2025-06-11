import { FC, useEffect, useState } from 'react'
import ChessJS, { Square } from 'chess.js'
import { Flex } from '@chakra-ui/layout'
import LandingPageBoardSquare from './LandingPageBoardSquare'
import { STARTING_FEN } from 'store/boardSlice'

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
}

const demoEvals = [
  {
    eval: 0.19,
    move: 'c4',
    depth: 65
  },
  {
    eval: 0.18,
    move: 'e5',
    depth: 70
  },
  {
    eval: 0.22,
    move: 'Nf3',
    depth: 65
  },
  {
    eval: 0.13,
    move: 'Nc6',
    depth: 63
  },
  {
    eval: 0.21,
    move: 'Bb5',
    depth: 65
  },
  {
    eval: 0.15,
    move: 'Nf6',
    depth: 65
  },
  {
    eval: 0.64,
    move: 'O-O',
    depth: 55
  },
  {
    eval: 0.06,
    move: 'Nxe4',
    depth: 60
  },
  {
    eval: 0.14,
    move: 'Re1',
    depth: 60
  },
  {
    eval: 0.14,
    move: 'Nd6',
    depth: 52
  },
  {
    eval: 0.04,
    move: 'Bxc6',
    depth: 54
  },
  {
    eval: 0.07,
    move: 'dxc6',
    depth: 50
  },
  {
    eval: 0.17,
    move: 'dxe5',
    depth: 44
  },
  {
    eval: 0.05,
    move: 'Nf5',
    depth: 55
  },
  {
    eval: 0.11,
    move: 'Qxd8+',
    depth: 38
  },
  {
    eval: 0.04,
    move: 'Kxd8',
    depth: 39
  },
  {
    eval: 0.14,
    move: 'h3',
    depth: 57
  }
] as DemoEval[]

interface Props {
  onDemoEval: (ev: DemoEval) => void
}

const LandingPageChessboard: FC<Props> = ({ onDemoEval }) => {
  //   const squareLength = useBreakpointValue({
  //     base: 11.5,
  //     md: 10,
  //     lg: 8,
  //     xl: 6,
  //     '2xl': 5.2
  //   })
  const [chess, setChess] = useState(() => new Chess())
  const [scrollY, setScrollY] = useState(0)
  const [lastMove, setLastMove] = useState('')
  const [engineEval, setEngineEval] = useState<DemoEval>(demoEvals[0])
  const squareLength = 3

  useEffect(() => {
    setChess(new Chess(STARTING_FEN))
    onDemoEval(demoEvals[0])
    const handleScroll = () => {
      let moveCount = Math.floor((window.scrollY - 1000) / 120)
      setScrollY(moveCount) // Or document.documentElement.scrollTop
      const pos = new Chess(STARTING_FEN)
      if (moveCount < 0) {
        setChess(pos)
        setEngineEval(demoEvals[0])
        onDemoEval(demoEvals[0])
        setLastMove('')
        return
      }
      let moveIdx = 0
      while (moveCount >= 0) {
        const move = moves[moveIdx++]
        if (!move) {
          moveIdx--
          break
        }
        pos.move({
          from: move.substring(0, 2) as Square,
          to: move.substring(2, 4) as Square
        })
        moveCount--
      }
      setLastMove(moves[moveIdx - 1])
      setEngineEval(demoEvals[moveIdx])
      onDemoEval(demoEvals[moveIdx])
      setChess(pos)
      console.warn(pos.fen())
    }

    window.addEventListener('scroll', handleScroll)

    // Clean up listener on unmount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Flex w='100%' h='100%' justifyContent='center' alignItems='center' flexDir={'column'}>
      {engineEval.move}
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
    </Flex>
  )
}

export default LandingPageChessboard
