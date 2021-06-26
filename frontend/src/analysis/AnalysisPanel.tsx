import { Flex, Text } from '@chakra-ui/layout'
import { FC, useEffect, useState } from 'react'
import { useAppSelector } from '../hooks'
import Stockfish, { Analysis } from './Stockfish'

const AnalysisPanel: FC = () => {
  const [evaluation, setEvaluation] = useState(0)
  const [bestMove, setBestMove] = useState('')
  const [depth, setDepth] = useState(0)
  const moveHistory = useAppSelector(state => state.board.moveHistory)
  const onAnalysis = (analysis: Analysis) => {
    if (analysis.score) {
      setEvaluation(analysis.score / 100)
    }
    if (analysis.depth) {
      setDepth(analysis.depth)
    }
    setBestMove(analysis.bestMove)
  }
  const onReady = () => {
    stockfish.createNewGame()
    stockfish.analyzePosition(moveHistory)
  }
  const [stockfish, setStockfish] = useState(() => new Stockfish(onAnalysis, onReady))
  stockfish.onAnalysis = onAnalysis

  useEffect(() => {
    if (!stockfish.isReady) {
      return
    }
    ;(async function () {
      console.log('analyzing...')
      // stockfish.stop()
      // console.time('Ready')
      // console.timeEnd('Ready')

      stockfish.quit()
      stockfish.createNewGame()
      setBestMove('')
      stockfish.analyzePosition(moveHistory)
    })()
  }, [stockfish, moveHistory])

  return (
    <Flex
      flexDir='column'
      justifyContent='space-between'
      borderRadius='10px'
      bg='gray.700'
      w='100%'
      h='100%'
      p='5%'
      fontWeight='bold'
    >
      <Text>Analysis</Text>
      <Text>Eval: {evaluation * (moveHistory.length % 2 === 0 ? 1 : -1)}</Text>
      <Text>Best Move: {bestMove}</Text>
      <Text>Depth: {depth}</Text>
    </Flex>
  )
}

export default AnalysisPanel
