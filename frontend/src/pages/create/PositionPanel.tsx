import { IconButton } from '@chakra-ui/button'
import { ChevronLeftIcon, ChevronRightIcon, RepeatIcon } from '@chakra-ui/icons'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { FC, useEffect, useMemo, useState } from 'react'
import ChessJS from 'chess.js'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import { flipBoard, traverseBackwards, traverseForwards } from 'store/boardSlice'
import Stockfish from 'utils/analysis/Stockfish'
import DarkTooltip from 'components/DarkTooltip'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

// todo: add lichess cloud eval when available for greater depth
const PositionPanel: FC = () => {
  const { pgn, halfMoveCount, historySize, moveHistory, fen } = useAppSelector(state => ({
    pgn: state.board.pgn,
    halfMoveCount: state.board.halfMoveCount,
    historySize: state.board.history.length,
    moveHistory: state.board.moveHistory,
    fen: state.board.fen
  }))
  const [evaluation, setEvaluation] = useState(0)
  const [bestMove, setBestMove] = useState('...')
  const [depth, setDepth] = useState(0)
  const [isLoading, setLoading] = useState(true)
  const uciMoves = useMemo(
    () =>
      moveHistory
        .slice(0, halfMoveCount)
        .map(m => m.uci)
        .join(' '),
    [moveHistory, halfMoveCount]
  )
  const onAnalysis = (sf: Stockfish, bestMove: string, d: number) => {
    if (!sf.isReady) {
      console.log('not ready')
      return
    }
    console.log('onAnalysis')
    if (isLoading && d !== 5) {
      return
    }
    const from = bestMove.substr(0, 2)
    const to = bestMove.substr(2, 2)
    const matchingMoves = new Chess(fen).moves({ verbose: true }).filter(m => m.from === from && m.to === to)
    if (!matchingMoves.length) {
      // Invalid move (likely from a previous run)
      return
    }
    sf.stop()
    sf.quit()
    sf.analyzePosition(uciMoves, d + 1)
    setLoading(false)
    setDepth(d)
    setBestMove(matchingMoves[0].san)
  }
  const onEvaluation = (cp: number) => {
    console.log('onEvaluation: ', new Date().getTime())
    setEvaluation(cp / 100)
  }
  const onReady = () => {
    console.log('onReady')
    stockfish.createNewGame()
    stockfish.analyzePosition(uciMoves, 5)
  }
  const [stockfish] = useState(() => new Stockfish(onAnalysis, onReady, onEvaluation))
  stockfish.onAnalysis = onAnalysis

  useEffect(
    () => () => {
      console.log('unload: ', new Date().getTime())
      stockfish.onAnalysis = null
      stockfish.onEvaluation = null
      stockfish.onReady = null
      stockfish.terminate()
    },
    [stockfish]
  )

  useEffect(() => {
    if (!stockfish.isReady) {
      return
    }
    console.log('analyzing...')
    stockfish.quit()
    stockfish.createNewGame()
    setBestMove('...')
    setDepth(0)
    setLoading(true)
    stockfish.analyzePosition(uciMoves, 5)
    return
  }, [stockfish, uciMoves])
  const dispatch = useAppDispatch()

  const whitePerspectiveEvaluation = evaluation * (halfMoveCount % 2 === 0 ? 1 : -1)

  return (
    <Flex
      flexDir='column'
      justifyContent='space-between'
      borderRadius='3px'
      bg='surface'
      borderWidth='2px'
      borderStyle='solid'
      borderColor='surfaceBorder'
      w='100%'
      h='100%'
      p='5%'
    >
      <Box>
        <Text fontSize='1.5em' fontWeight='bold' color='whiteText' mb='10px'>
          {pgn}
        </Text>
        <Flex>
          <DarkTooltip label='Back'>
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label='Back'
              onClick={() => dispatch(traverseBackwards())}
              disabled={halfMoveCount <= 0}
            />
          </DarkTooltip>
          <DarkTooltip label='Forward'>
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label='Forward'
              onClick={() => dispatch(traverseForwards())}
              disabled={halfMoveCount >= historySize - 1}
            />
          </DarkTooltip>
          <DarkTooltip label='Flip board'>
            <IconButton icon={<RepeatIcon />} aria-label='Flip board' onClick={() => dispatch(flipBoard())} ml='20px' />
          </DarkTooltip>
        </Flex>
      </Box>
      <Box>
        <Text fontSize='18px' fontWeight='bold' color='whiteText' mb='5px'>
          Analysis
        </Text>
        <Text fontSize='16px' color='whiteText' mb='3px'>
          Evaluation: {isLoading ? `${-whitePerspectiveEvaluation}...` : whitePerspectiveEvaluation}
        </Text>
        <Text fontSize='16px' color='whiteText' mb='3px'>
          Best move: {bestMove}
        </Text>
        <Text fontSize='16px' color='whiteText' mb='3px'>
          Depth: {depth}
          {/* todo: allow user to increase depth */}
        </Text>
        <Text fontSize='16px' color='whiteText' mb='10px' wordBreak='break-all'>
          FEN: {fen}
        </Text>
      </Box>
    </Flex>
  )
}

export default PositionPanel
