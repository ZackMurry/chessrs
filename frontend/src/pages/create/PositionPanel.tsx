import { IconButton } from '@chakra-ui/button'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  RepeatIcon,
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
  updateOpening,
} from 'store/boardSlice'
import Stockfish from 'utils/analysis/Stockfish'
import DarkTooltip from 'components/DarkTooltip'
import ImportGameFromLichess from 'components/ImportGameFromLichess'
import { useBreakpointValue, useToast } from '@chakra-ui/react'
import { CirclePlus, Cloud } from 'lucide-react'
import request, { gql } from 'graphql-request'
import { TOAST_DURATION } from 'theme'
import ErrorToast from 'components/ErrorToast'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

interface EngineEvaluation {
  depth: number
  eval?: number
  forcedMate: boolean
  bestMove: string
  fen: string
  provider: 'LICHESS' | 'CHESSRS'
}

// todo: add hosted cloud eval when available for greater depth (and lichess cached cloud)
const PositionPanel: FC = () => {
  const { pgn, halfMoveCount, moveHistory, fen } = useAppSelector((state) => ({
    pgn: state.board.pgn,
    halfMoveCount: state.board.halfMoveCount,
    moveHistory: state.board.moveHistory,
    fen: state.board.fen,
  }))
  const [evaluation, setEvaluation] = useState(0)
  const [bestMove, setBestMove] = useState('...')
  const [depth, setDepth] = useState(0)
  const [isLoading, setLoading] = useState(true)
  const [isForcedMate, setForcedMate] = useState(false)
  const [engineEval, setEngineEval] = useState<EngineEvaluation | null>(null)
  const isTraverseBarShowing = useBreakpointValue({ base: true, lg: false })
  const toast = useToast()

  const uciMoves = useMemo(
    () =>
      moveHistory
        .slice(0, halfMoveCount)
        .map((m) => m.uci)
        .join(' '),
    [moveHistory, halfMoveCount],
  )
  const onAnalysis = (sf: Stockfish, bestMove: string, d: number) => {
    if (!sf.isReady) {
      console.log('not ready')
      return
    }
    if (isLoading && d !== 5) {
      return
    }
    const from = bestMove.substr(0, 2)
    const to = bestMove.substr(2, 2)
    const matchingMoves = new Chess(fen)
      .moves({ verbose: true })
      .filter((m) => m.from === from && m.to === to)
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
    if (mate) {
      setForcedMate(true)
      setEvaluation(mate)
    } else {
      setForcedMate(false)
      setEvaluation(cp / 100)
    }
  }
  const onReady = () => {
    console.log('onReady')
    stockfish.createNewGame()
    stockfish.analyzePosition(uciMoves, 5)
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
    if (!stockfish.isReady) {
      return
    }
    console.log('Rerunning stockfish in useeffect (onReady)')
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

  const browserEngine = !engineEval || engineEval.fen !== fen
  console.log(engineEval)
  const evalScore = browserEngine
    ? halfMoveCount % 2 === 0
      ? evaluation
      : -evaluation
    : engineEval?.eval
  const engDepth = browserEngine ? depth : engineEval?.depth
  const engine = browserEngine ? 'BROWSER' : engineEval?.provider
  const forcedMate = engine === 'BROWSER' ? isForcedMate : engineEval.forcedMate
  const depthText =
    engine === 'BROWSER'
      ? 'Use cloud engine analysis'
      : `Engine analysis provided by ${
          engine.charAt(0).toLocaleUpperCase() +
          engine.substr(1).toLocaleLowerCase()
        }`

  const onImportGame = (
    moveStr: string,
    isWhite: boolean,
    opening?: Opening,
  ) => {
    dispatch(resetBoard())
    dispatch(loadMoves(moveStr))
    if (opening) {
      dispatch(updateOpening(opening))
    }
    if (!isWhite) {
      dispatch(flipBoard())
    }
  }

  const showCloudAnalysis = async () => {
    setLoading(true)
    // stockfish.stop()
    // stockfish.quit()
    const query = gql`
      query CloudEngineAnalysis($fen: String!) {
        engineAnalysis(fen: $fen) {
          fen
          depth
          eval
          mate
          provider
          mainLine
        }
      }
    `
    try {
      const data = await request('/api/v1/graphql', query, { fen })
      console.log('updating eval')
      if (
        (data.engineAnalysis?.eval !== undefined ||
          data.engineAnalysis?.mate !== undefined) &&
        data.engineAnalysis?.depth &&
        data.engineAnalysis.fen
      ) {
        const firstMove = data.engineAnalysis.mainLine.split(' ')[0] // todo: make API return SAN
        const from = firstMove.substr(0, 2)
        const to = firstMove.substr(2, 2)
        console.log(data.engineAnalysis.fen)
        const matchingMoves = new Chess(data.engineAnalysis.fen as string)
          .moves({ verbose: true })
          .filter((m) => m.from === from && m.to === to)
        console.log(matchingMoves)
        if (!matchingMoves.length) {
          // Invalid move (likely from a previous run)
          setLoading(false)
          setEngineEval(null)
          return
        }
        setEngineEval({
          depth: data.engineAnalysis.depth as number,
          eval:
            data.engineAnalysis.mate ?? (data.engineAnalysis.eval as number),
          forcedMate: data.engineAnalysis.mate !== null,
          bestMove: matchingMoves[0].san,
          fen: data.engineAnalysis.fen as string,
          provider: data.engineAnalysis.provider as 'LICHESS' | 'CHESSRS',
        })
      }
      console.log('updated eval')
    } catch (e) {
      toast({
        duration: TOAST_DURATION,
        isClosable: true,
        render: (options) => (
          <ErrorToast
            description={`Error getting position information: ${e}`}
            onClose={options.onClose}
          />
        ),
      })
    }
    setLoading(false)
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
          <h3 className='text-xl font-bold text-offwhite mb-4'>{pgn}</h3>
        </Box>
        <Flex>
          {!isTraverseBarShowing && (
            // could make this look a lot better using a different component library
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
            <IconButton
              icon={<RepeatIcon />}
              aria-label='Flip board'
              onClick={() => dispatch(flipBoard())}
            />
          </DarkTooltip>
        </Flex>
      </Box>
      <ImportGameFromLichess onImport={onImportGame} />
      <Box>
        <h3 className='text-xl font-bold text-offwhite mb-1'>Analysis</h3>
        <h6 className='text-md text-offwhite mb-1'>
          Evaluation:{' '}
          {isLoading
            ? `${forcedMate ? '#' : ''}${evalScore}...`
            : `${forcedMate ? '#' : ''}${evalScore}`}
        </h6>
        <h6 className='text-md text-offwhite mb-1'>
          Best move: {engine === 'BROWSER' ? bestMove : engineEval.bestMove}
        </h6>
        <h6 className='text-md text-offwhite mb-1 flex justify-start items-center'>
          Depth: {engDepth}
          {isLoading && '...'}
          {/* todo: need to fix tooltip popup settings */}
          <DarkTooltip label={depthText} openDelay={700}>
            <div>
              {engine === 'BROWSER' && !isLoading && (
                <IconButton
                  icon={<CirclePlus size='18' color='white' />}
                  aria-label='Increase depth'
                  className='!ring-none !shadow-none ml-1'
                  variant='ghost'
                  borderRadius='3xl'
                  padding='0'
                  size='xs'
                  // className='hover:!bg-none'
                  _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  onClick={showCloudAnalysis}
                />
              )}
              {engine === 'CHESSRS' && !isLoading && (
                <Cloud color='white' size='18' fill='white' className='ml-2' />
              )}
              {engine === 'LICHESS' && (
                // <Cloud color='red' size='18' />
                <img
                  src='lichess-logo-inverted.png'
                  width={18}
                  height={18}
                  className='ml-2'
                  alt='Lichess logo'
                />
              )}
            </div>
          </DarkTooltip>
        </h6>
        <h6 className='text-md text-offwhite mb-1'>
          FEN:
          <ChakraLink
            ml='2px'
            isExternal
            href={`https://lichess.org/analysis?fen=${encodeURIComponent(fen)}`}
          >
            {fen} <ExternalLinkIcon ml='4px' mt='-2px' />
          </ChakraLink>
        </h6>
      </Box>
    </Flex>
  )
}

export default PositionPanel
