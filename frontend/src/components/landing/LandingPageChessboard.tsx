import { FC, useEffect, useRef, useState } from 'react'
import ChessJS, { Square } from 'chess.js'
import { Flex } from '@chakra-ui/layout'
import LandingPageBoardSquare from './LandingPageBoardSquare'
import { STARTING_FEN } from 'store/boardSlice'
import { motion, useAnimation } from 'framer-motion'
import DarkTooltip from 'components/DarkTooltip'
import { IconButton } from '@chakra-ui/react'
import { Eye } from 'lucide-react'

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

const LandingPageChessboard: FC = () => {
  //   const squareLength = useBreakpointValue({
  //     base: 11.5,
  //     md: 10,
  //     lg: 8,
  //     xl: 6,
  //     '2xl': 5.2
  //   })
  const [chess, setChess] = useState(() => new Chess())
  const [lastMove, setLastMove] = useState('')
  const [engineEval, setEngineEval] = useState<DemoEval>(demoEvals[0])
  const currentState = useRef<'hidden' | 'visible'>('hidden')
  const squareLength = 3
  const controls = useAnimation()

  useEffect(() => {
    setChess(new Chess(STARTING_FEN))
    const handleScroll = () => {
      let moveCount = Math.floor((window.scrollY - 1000) / 180)
      const shouldBeVisible = window.scrollY > 1700 // && window.scrollY < 2500
      if (shouldBeVisible && currentState.current !== 'visible') {
        controls.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: 'easeOut' }
        })
        currentState.current = 'visible'
      } else if (!shouldBeVisible && currentState.current !== 'hidden') {
        console.log('hiding')
        controls.start({
          opacity: 0,
          y: -50,
          transition: { duration: 0.4, ease: 'easeIn' }
        })
        currentState.current = 'hidden'
      }
      const pos = new Chess(STARTING_FEN)
      if (moveCount < 0) {
        setChess(pos)
        setEngineEval(demoEvals[0])
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
      setChess(pos)
      console.warn(pos.fen())
    }

    window.addEventListener('scroll', handleScroll)

    // Clean up listener on unmount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Flex w='100%' h='100%' justifyContent='center' alignItems='end' flexDir={'column'}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={controls}
        className='w-full p-4 bg-surface border-[2px] border-solid border-surfaceBorder rounded-[3px] max-w-[300px] absolute top-20 -right-[200px] z-10 bg'
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
      </motion.div>
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
