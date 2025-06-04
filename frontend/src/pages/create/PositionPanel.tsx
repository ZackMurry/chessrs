import { IconButton } from '@chakra-ui/button'
import {
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  FlipVertical,
} from 'lucide-react'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { FC, useEffect, useMemo, useState } from 'react'
import ChessJS from 'chess.js'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import {
  flipBoard,
  traverseBackwards,
  traverseForwards,
  traverseToEnd,
  traverseToStart,
} from 'store/boardSlice'
import Stockfish, { SF_DEPTH } from 'utils/analysis/Stockfish'
import DarkTooltip from 'components/DarkTooltip'
import ImportGameFromLichess from 'components/ImportGameFromLichess'
import { useBreakpointValue } from '@chakra-ui/react'
import PGNDisplay from 'components/PGNDisplay'
import AnalysisOverview from 'components/AnalysisOverview'
import {
  updateLocalBestMove,
  updateLocalAnalysis,
  setLocalAnalysisLoading,
  setCloudAnalysisLoading,
} from 'store/analysisSlice'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const PositionPanel: FC = () => {
  const { halfMoveCount, moveHistory, fen } = useAppSelector((state) => ({
    pgn: state.board.pgn,
    halfMoveCount: state.board.halfMoveCount,
    moveHistory: state.board.moveHistory,
    fen: state.board.fen,
  }))
  const isTraverseBarShowing = useBreakpointValue({ base: true, lg: false })
  const dispatch = useAppDispatch()

  const localEvalMultiplier = halfMoveCount % 2 === 0 ? 1 : -1

  const uciMoves = useMemo(
    () =>
      moveHistory
        .slice(0, halfMoveCount)
        .map((m) => m.uci)
        .join(' '),
    [moveHistory, halfMoveCount],
  )
  const onAnalysis = (bestMove: string, sfFen: string) => {
    const from = bestMove.substr(0, 2)
    const to = bestMove.substr(2, 2)
    const matchingMoves = new Chess(sfFen)
      .moves({ verbose: true })
      .filter((m) => m.from === from && m.to === to)
    if (!matchingMoves.length) {
      // Invalid move (likely from a previous run)
      console.error("Move doesn't match fen!")
      return
    }
    dispatch(
      updateLocalBestMove({
        san: matchingMoves[0].san,
        uci: bestMove,
      }),
    )
    dispatch(setLocalAnalysisLoading(false))
  }
  const onReady = () => {
    console.log('onReady')
    stockfish.createNewGame()
    stockfish.analyzePosition(uciMoves, SF_DEPTH, fen)
  }
  const onEvaluation = (
    cp: number,
    mate: number,
    bestMove: string,
    d: number,
    sfFen: string,
  ) => {
    const from = bestMove.substr(0, 2)
    const to = bestMove.substr(2, 2)
    const matchingMoves = new Chess(sfFen)
      .moves({ verbose: true })
      .filter((m) => m.from === from && m.to === to)
    if (!matchingMoves.length) {
      console.error('Moves dont match', sfFen, bestMove)
      // Invalid move (likely from a previous run)
      return
    }
    dispatch(
      updateLocalAnalysis({
        bestMove: {
          uci: bestMove,
          san: matchingMoves[0].san,
        },
        depth: d,
        fen: sfFen,
        eval: (cp / 100) * localEvalMultiplier,
        mate,
        engine: 'BROWSER',
      }),
    )
    if (d >= 20) {
      dispatch(setLocalAnalysisLoading(false))
    }
  }
  const [stockfish] = useState(
    () => new Stockfish(onAnalysis, onReady, onEvaluation),
  )
  stockfish.onAnalysis = onAnalysis

  useEffect(
    () => () => {
      stockfish.onAnalysis = null
      stockfish.onEvaluation = null
      stockfish.onReady = null
      stockfish.terminate()
    },
    [stockfish],
  )

  useEffect(() => {
    dispatch(setCloudAnalysisLoading(false))
    dispatch(setLocalAnalysisLoading(true))
    const runStockfish = () => {
      stockfish.onEvaluation = onEvaluation
      // stockfish.createNewGame()
      stockfish.analyzePosition(uciMoves, SF_DEPTH, fen)
    }
    console.log('Rerunning stockfish in useeffect (onReady)')
    if (new Chess(fen).in_checkmate()) {
      dispatch(
        updateLocalAnalysis({
          bestMove: null,
          depth: 0,
          engine: 'BROWSER',
          eval: null,
          mate: 0,
          fen,
        }),
      )
      dispatch(setLocalAnalysisLoading(false))
      return
    }
    // if (!stockfish.isReady) {
    //   console.warn('sf not ready!')
    //   stockfish.onReady = runStockfish
    //   return
    // }
    stockfish.onReady = runStockfish
    runStockfish()
  }, [stockfish, uciMoves, fen, halfMoveCount, dispatch])

  // const browserEngine = !engineEval || engineEval.fen !== fen
  // const evalScore = browserEngine
  //   ? halfMoveCount % 2 === 0
  //     ? evaluation
  //     : -evaluation
  //   : engineEval?.eval
  // const engDepth = browserEngine ? depth : engineEval?.depth
  // const engine = browserEngine ? 'BROWSER' : engineEval?.provider
  // const forcedMate = engine === 'BROWSER' ? isForcedMate : engineEval.forcedMate

  // const evalString = forcedMate ? evalScore : evalScore.toFixed(2)

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
        <Flex>
          {!isTraverseBarShowing && (
            // could make this look a lot better using a different component library
            <Box mr='20px'>
              <DarkTooltip label='Start (s)'>
                <IconButton
                  icon={<ChevronsLeft />}
                  aria-label='Start'
                  onClick={() => dispatch(traverseToStart())}
                  disabled={halfMoveCount <= 0}
                  className='text-black'
                />
              </DarkTooltip>
              <DarkTooltip label='Back (←)'>
                <IconButton
                  icon={<ChevronLeft />}
                  aria-label='Back'
                  onClick={() => dispatch(traverseBackwards())}
                  disabled={halfMoveCount <= 0}
                  fontSize='4xl'
                  className='text-black'
                />
              </DarkTooltip>
              <DarkTooltip label='Forward (→)'>
                <IconButton
                  icon={<ChevronRight />}
                  aria-label='Forward'
                  onClick={() => dispatch(traverseForwards())}
                  disabled={halfMoveCount >= moveHistory.length}
                  fontSize='4xl'
                  className='text-black'
                />
              </DarkTooltip>
              <DarkTooltip label='End (e)'>
                <IconButton
                  icon={<ChevronsRight />}
                  aria-label='End'
                  onClick={() => dispatch(traverseToEnd())}
                  disabled={halfMoveCount >= moveHistory.length}
                  className='text-black'
                />
              </DarkTooltip>
            </Box>
          )}
          <DarkTooltip label='Flip board (f)'>
            <IconButton
              icon={<FlipVertical />}
              aria-label='Flip board'
              onClick={() => dispatch(flipBoard())}
              className='text-black'
            />
          </DarkTooltip>
        </Flex>
        <PGNDisplay />
      </Box>
      <div>
        <ImportGameFromLichess />
        <AnalysisOverview />
      </div>
    </Flex>
  )
}

export default PositionPanel
