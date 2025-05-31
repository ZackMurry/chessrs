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
  makeMove,
  Opening,
  resetBoard,
  traverseBackwards,
  traverseForwards,
  traverseToEnd,
  traverseToStart,
  updateOpening,
} from 'store/boardSlice'
import Stockfish, { SF_DEPTH } from 'utils/analysis/Stockfish'
import DarkTooltip from 'components/DarkTooltip'
import ImportGameFromLichess from 'components/ImportGameFromLichess'
import { useBreakpointValue, useToast, Spinner } from '@chakra-ui/react'
import { CirclePlus, Cloud, Eye, View } from 'lucide-react'
import request, { gql } from 'graphql-request'
import { TOAST_DURATION } from 'theme'
import ErrorToast from 'components/ErrorToast'
import PGNDisplay from 'components/PGNDisplay'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

interface EngineEvaluation {
  depth: number
  eval?: number
  forcedMate: boolean
  bestMove: string
  fen: string
  provider: 'LICHESS' | 'CHESSRS'
  bestMoveUCI: string
}

const PositionPanel: FC = () => {
  const { pgn, halfMoveCount, moveHistory, fen } = useAppSelector((state) => ({
    pgn: state.board.pgn,
    halfMoveCount: state.board.halfMoveCount,
    moveHistory: state.board.moveHistory,
    fen: state.board.fen,
  }))
  const [evaluation, setEvaluation] = useState(0)
  const [bestMove, setBestMove] = useState({
    uci: '',
    san: '',
    loading: true,
  })
  const [depth, setDepth] = useState(0)
  const [isLoading, setLoading] = useState(true)
  const [isForcedMate, setForcedMate] = useState(false)
  const [engineEval, setEngineEval] = useState<EngineEvaluation | null>(null)
  const [isCloudLoading, setCloudLoading] = useState(false)
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
  const onAnalysis = (
    sf: Stockfish,
    bestMove: string,
    d: number,
    sfFen: string,
  ) => {
    if (!sf.isReady) {
      console.log('not ready')
      return
    }
    // if (isLoading && d !== 5) {
    //   return
    // }
    const from = bestMove.substr(0, 2)
    const to = bestMove.substr(2, 2)
    const matchingMoves = new Chess(sfFen)
      .moves({ verbose: true })
      .filter((m) => m.from === from && m.to === to)
    if (!matchingMoves.length) {
      // Invalid move (likely from a previous run)
      return
    }
    sf.stop()
    // sf.quit()
    setLoading(false)
    setDepth(d)
    setBestMove({ san: matchingMoves[0].san, uci: bestMove, loading: false })
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
    if (mate) {
      console.warn('found mate!')
      setForcedMate(true)
      setEvaluation(mate)
    } else {
      setForcedMate(false)
      setEvaluation(cp / 100)
    }
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
    setBestMove({ san: matchingMoves[0].san, uci: bestMove, loading: false })
    setDepth(d)
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
    const runStockfish = () => {
      stockfish.onEvaluation = onEvaluation
      stockfish.createNewGame()
      setBestMove({ uci: '', san: '', loading: true })
      setDepth(0)
      stockfish.analyzePosition(uciMoves, SF_DEPTH, fen)
    }
    setEvaluation(0)
    setLoading(true)
    setBestMove({ uci: '', san: '', loading: true })
    console.log('Rerunning stockfish in useeffect (onReady)')
    if (new Chess(fen).in_checkmate()) {
      if (halfMoveCount % 2 === 0) {
        setEvaluation(0)
      } else {
        setEvaluation(0)
      }
      setForcedMate(true)
      setBestMove({ uci: '', san: '', loading: false })
      setLoading(false)
      return
    }
    if (!stockfish.isReady) {
      console.warn('sf not ready!')
      stockfish.onReady = runStockfish
      return
    }
    runStockfish()
  }, [stockfish, uciMoves, fen, setEvaluation, halfMoveCount])
  const dispatch = useAppDispatch()

  const browserEngine = !engineEval || engineEval.fen !== fen
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
    setCloudLoading(true)
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
          bestMoveUCI: firstMove,
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
    setCloudLoading(false)
  }

  const viewMoveOnBoard = (uci: string) => {
    dispatch(makeMove(uci))
  }

  const onLichessExit = () => {
    dispatch(resetBoard())
  }

  const evalString = forcedMate ? evalScore : evalScore.toFixed(2)

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
                  icon={<ArrowLeftIcon />}
                  aria-label='Start'
                  onClick={() => dispatch(traverseToStart())}
                  disabled={halfMoveCount <= 0}
                />
              </DarkTooltip>
              <DarkTooltip label='Back (←)'>
                <IconButton
                  icon={<ChevronLeftIcon />}
                  aria-label='Back'
                  onClick={() => dispatch(traverseBackwards())}
                  disabled={halfMoveCount <= 0}
                  fontSize='4xl'
                />
              </DarkTooltip>
              <DarkTooltip label='Forward (→)'>
                <IconButton
                  icon={<ChevronRightIcon />}
                  aria-label='Forward'
                  onClick={() => dispatch(traverseForwards())}
                  disabled={halfMoveCount >= moveHistory.length}
                  fontSize='4xl'
                />
              </DarkTooltip>
              <DarkTooltip label='End (e)'>
                <IconButton
                  icon={<ArrowRightIcon />}
                  aria-label='End'
                  onClick={() => dispatch(traverseToEnd())}
                  disabled={halfMoveCount >= moveHistory.length}
                />
              </DarkTooltip>
            </Box>
          )}
          <DarkTooltip label='Flip board (f)'>
            <IconButton
              icon={<RepeatIcon />}
              aria-label='Flip board'
              onClick={() => dispatch(flipBoard())}
            />
          </DarkTooltip>
        </Flex>
        <PGNDisplay />
      </Box>
      <div>
        <ImportGameFromLichess onImport={onImportGame} onExit={onLichessExit} />
        <Box>
          <h3 className='text-xl font-bold text-offwhite mb-1'>Analysis</h3>
          <h6 className='text-md text-offwhite mb-1'>
            Evaluation: {forcedMate ? '#' : ''}
            {evalString}
            {isLoading ? '...' : ''}
          </h6>
          <div className='flex justify-start items-center mb-1'>
            <h6 className='text-md text-offwhite min-w-[110px]'>
              Best move:{' '}
              {engine === 'BROWSER'
                ? bestMove.loading
                  ? '...'
                  : bestMove.san
                : engineEval.bestMove}
            </h6>
            {!bestMove.loading && (
              <DarkTooltip label='View move on board' key='view-move-tooltip'>
                <IconButton
                  icon={<Eye color='white' size='18' />}
                  aria-label='View move on board'
                  className='!ring-none !shadow-none ml-1'
                  variant='ghost'
                  borderRadius='3xl'
                  spinner={<Spinner size='48' />}
                  padding='0'
                  size='xs'
                  // className='hover:!bg-none'
                  _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  onClick={() =>
                    viewMoveOnBoard(
                      engine === 'BROWSER'
                        ? bestMove.uci
                        : engineEval.bestMoveUCI,
                    )
                  }
                />
              </DarkTooltip>
            )}
          </div>
          <h6 className='text-md text-offwhite mb-1 flex justify-start items-center'>
            <div className='min-w-[80px]'>Depth: {engDepth}</div>
            <DarkTooltip
              key={depthText}
              label={depthText}
              openDelay={1000}
              closeOnClick={true}
            >
              <div>
                {engine === 'BROWSER' && (
                  <IconButton
                    icon={<CirclePlus size='18' color='white' />}
                    aria-label='Increase depth'
                    className='!ring-none !shadow-none ml-1'
                    variant='ghost'
                    borderRadius='3xl'
                    isLoading={isCloudLoading}
                    spinner={<Spinner size='sm' />}
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
                  <Cloud
                    color='white'
                    size='18'
                    fill='white'
                    className='ml-2'
                  />
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
              href={`https://lichess.org/analysis?fen=${encodeURIComponent(
                fen,
              )}`}
            >
              {fen} <ExternalLinkIcon ml='4px' mt='-2px' />
            </ChakraLink>
          </h6>
        </Box>
      </div>
    </Flex>
  )
}

export default PositionPanel
