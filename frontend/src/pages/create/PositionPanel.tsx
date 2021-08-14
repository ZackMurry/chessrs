import { IconButton } from '@chakra-ui/button'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  RepeatIcon
} from '@chakra-ui/icons'
import { Box, Flex, Link as ChakraLink, Text } from '@chakra-ui/layout'
import { FC, useEffect, useMemo, useState } from 'react'
import ChessJS from 'chess.js'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import {
  flipBoard,
  loadMoves,
  Opening,
  resetBoard,
  traverseBackwards,
  traverseForwards,
  traverseToEnd,
  traverseToStart,
  updateOpening
} from 'store/boardSlice'
import Stockfish from 'utils/analysis/Stockfish'
import DarkTooltip from 'components/DarkTooltip'
import ImportGameFromLichess from 'components/ImportGameFromLichess'
import { useBreakpointValue } from '@chakra-ui/react'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

// todo: add lichess cloud eval when available for greater depth
// todo: skip to end and beginning of PGN
const PositionPanel: FC = () => {
  const { pgn, halfMoveCount, moveHistory, fen } = useAppSelector(state => ({
    pgn: state.board.pgn,
    halfMoveCount: state.board.halfMoveCount,
    moveHistory: state.board.moveHistory,
    fen: state.board.fen
  }))
  const [evaluation, setEvaluation] = useState(0)
  const [bestMove, setBestMove] = useState('...')
  const [depth, setDepth] = useState(0)
  const [isLoading, setLoading] = useState(true)
  const [isForcedMate, setForcedMate] = useState(false)
  const isTraverseBarShowing = useBreakpointValue({ base: true, lg: false })

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
  const onEvaluation = (cp: number, mate: number) => {
    // todo: mate in ...
    if (mate) {
      setForcedMate(true)
      setEvaluation(mate)
    } else {
      console.log('onEvaluation: ', cp)
      setForcedMate(false)
      setEvaluation(cp / 100)
    }
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
    if (new Chess(fen).in_checkmate()) {
      if (halfMoveCount % 2 === 0) {
        setEvaluation(Number.NEGATIVE_INFINITY)
      } else {
        setEvaluation(Number.POSITIVE_INFINITY)
      }
      setForcedMate(true)
      setBestMove('')
      setLoading(false)
      return
    }
    stockfish.analyzePosition(uciMoves, 5)
  }, [stockfish, uciMoves, fen, setEvaluation, halfMoveCount])
  const dispatch = useAppDispatch()

  const whitePerspectiveEvaluation = evaluation * (halfMoveCount % 2 === 0 ? 1 : -1)

  const onImportGame = (moveStr: string, isWhite: boolean, opening?: Opening) => {
    dispatch(resetBoard())
    dispatch(loadMoves(moveStr))
    if (opening) {
      updateOpening(opening)
    }
    if (!isWhite) {
      dispatch(flipBoard())
    }
  }

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
        <Box maxH='40vh' overflowY='auto'>
          <Text fontSize='1.2em' fontWeight='bold' color='whiteText' mb='10px'>
            {pgn}
          </Text>
        </Box>
        <Flex>
          {!isTraverseBarShowing && (
            <Box mr='20px'>
              <DarkTooltip label='Start'>
                <IconButton
                  icon={<ArrowLeftIcon />}
                  aria-label='Start'
                  onClick={() => dispatch(traverseToStart())}
                  disabled={halfMoveCount <= 0}
                />
              </DarkTooltip>
              <DarkTooltip label='Back'>
                <IconButton
                  icon={<ChevronLeftIcon />}
                  aria-label='Back'
                  onClick={() => dispatch(traverseBackwards())}
                  disabled={halfMoveCount <= 0}
                  fontSize='4xl'
                />
              </DarkTooltip>
              <DarkTooltip label='Forward'>
                <IconButton
                  icon={<ChevronRightIcon />}
                  aria-label='Forward'
                  onClick={() => dispatch(traverseForwards())}
                  disabled={halfMoveCount >= moveHistory.length}
                  fontSize='4xl'
                />
              </DarkTooltip>
              <DarkTooltip label='End'>
                <IconButton
                  icon={<ArrowRightIcon />}
                  aria-label='End'
                  onClick={() => dispatch(traverseToEnd())}
                  disabled={halfMoveCount >= moveHistory.length}
                />
              </DarkTooltip>
            </Box>
          )}
          <DarkTooltip label='Flip board'>
            <IconButton icon={<RepeatIcon />} aria-label='Flip board' onClick={() => dispatch(flipBoard())} />
          </DarkTooltip>
        </Flex>
      </Box>
      <ImportGameFromLichess onImport={onImportGame} />
      <Box>
        <Text fontSize='18px' fontWeight='bold' color='whiteText' mb='5px'>
          Analysis
        </Text>
        <Text fontSize='16px' color='whiteText' mb='3px'>
          Evaluation:{' '}
          {isLoading
            ? `${isForcedMate ? '#' : ''}${-whitePerspectiveEvaluation}...`
            : `${isForcedMate ? '#' : ''}${whitePerspectiveEvaluation}`}
        </Text>
        <Text fontSize='16px' color='whiteText' mb='3px'>
          Best move: {bestMove}
        </Text>
        <Text fontSize='16px' color='whiteText' mb='3px'>
          Depth: {depth}
          {/* todo: allow user to increase depth */}
        </Text>
        <Text fontSize='16px' color='whiteText' mb='10px' wordBreak='break-all'>
          FEN:
          <ChakraLink ml='2px' isExternal href={`https://lichess.org/analysis?fen=${encodeURIComponent(fen)}`}>
            {fen} <ExternalLinkIcon ml='4px' mt='-2px' />
          </ChakraLink>
        </Text>
      </Box>
    </Flex>
  )
}

export default PositionPanel
