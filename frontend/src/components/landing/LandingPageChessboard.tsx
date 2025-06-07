import { FC, useEffect, useState } from 'react'
import ChessJS, { Square } from 'chess.js'
import { Flex } from '@chakra-ui/layout'
import { useBreakpointValue } from '@chakra-ui/media-query'
import { useAppSelector } from 'utils/hooks'
import LandingPageBoardSquare from './LandingPageBoardSquare'
import { STARTING_FEN } from 'store/boardSlice'

interface Props {}

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

const LandingPageChessboard: FC<Props> = () => {
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
  const squareLength = 3

  useEffect(() => {
    setChess(new Chess(STARTING_FEN))
    const handleScroll = () => {
      let moveCount = Math.floor((window.scrollY - 1100) / 100)
      setScrollY(moveCount) // Or document.documentElement.scrollTop
      const pos = new Chess(STARTING_FEN)
      if (moveCount < 0) {
        setChess(pos)
        return
      }
      let moveIdx = 0
      while (moveCount >= 0) {
        const move = moves[moveIdx++]
        if (!move) break
        pos.move({
          from: move.substring(0, 2) as Square,
          to: move.substring(2, 4) as Square
        })
        moveCount--
      }
      setLastMove(moves[moveIdx - 1])
      setChess(pos)
      console.warn(pos.fen())
    }

    window.addEventListener('scroll', handleScroll)

    // Clean up listener on unmount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Flex w='100%' h='100%' justifyContent='center' alignItems='center' flexDir={'column'}>
      {scrollY}
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
