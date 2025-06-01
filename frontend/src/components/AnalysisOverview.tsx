import {
  Box,
  IconButton,
  Link as ChakraLink,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { CirclePlus, Cloud, Eye } from 'lucide-react'
import ChessJS from 'chess.js'
import DarkTooltip from './DarkTooltip'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import { makeMove } from 'store/boardSlice'
import {
  clearCloudAnalysis,
  setCloudAnalysisLoading,
  updateCloudAnalysis,
} from 'store/analysisSlice'
import { TOAST_DURATION } from 'theme'
import ErrorToast from './ErrorToast'
import request, { gql } from 'graphql-request'

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess

const AnalysisOverview = () => {
  const { fen, analysis, loading } = useAppSelector((state) => ({
    fen: state.board.fen,
    analysis:
      state.analysis.cloudAnalysis !== null &&
      state.analysis.cloudAnalysis.fen === state.board.fen
        ? state.analysis.cloudAnalysis
        : state.analysis.localAnalysis &&
          state.analysis.localAnalysis.fen === state.board.fen
        ? state.analysis.localAnalysis
        : null,
    loading: {
      cloud: state.analysis.cloudLoading,
      local: state.analysis.localLoading,
    },
  }))
  const dispatch = useAppDispatch()
  const toast = useToast()

  const viewMoveOnBoard = (uci: string) => {
    dispatch(makeMove(uci))
  }

  const showCloudAnalysis = async () => {
    // setLoading(true)
    // stockfish.stop()
    // stockfish.quit()
    dispatch(setCloudAnalysisLoading(true))
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
          // setLoading(false)
          dispatch(setCloudAnalysisLoading(false))
          dispatch(clearCloudAnalysis())
          return
        }
        dispatch(
          updateCloudAnalysis({
            depth: data.engineAnalysis.depth as number,
            eval: data.engineAnalysis.eval as number | null,
            fen: data.engineAnalysis.fen,
            engine: data.engineAnalysis.provider as 'LICHESS' | 'CHESSRS',
            bestMove: {
              san: matchingMoves[0].san,
              uci: firstMove,
            },
            mate: data.engineAnalysis.mate as number | null,
          }),
        )
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
    dispatch(setCloudAnalysisLoading(false))
  }

  const depthText = analysis
    ? analysis.engine === 'BROWSER'
      ? 'Use cloud engine analysis'
      : `Engine analysis provided by ${
          analysis.engine.charAt(0).toLocaleUpperCase() +
          analysis.engine.substr(1).toLocaleLowerCase()
        }`
    : ''

  return (
    <Box>
      <h3 className='text-xl font-bold text-offwhite mb-1'>Analysis</h3>
      <h6 className='text-md text-offwhite mb-1'>
        Evaluation:{' '}
        {analysis
          ? analysis.mate !== null
            ? `#${analysis.mate}`
            : analysis.eval
          : 0}
        {analysis?.engine === 'BROWSER' && loading.local && '...'}
        {/* {isLoading ? '...' : ''} */}
      </h6>
      <div className='flex justify-start items-center mb-1'>
        <h6 className='text-md text-offwhite min-w-[110px]'>
          Best move: {analysis?.bestMove ? analysis.bestMove.san : '...'}
          {/* {analysis.engine === 'BROWSER'
            ? bestMove.loading
              ? '...'
              : bestMove.san
            : engineEval.bestMove} */}
        </h6>
        {analysis?.bestMove && (
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
              onClick={() => viewMoveOnBoard(analysis.bestMove.uci)}
            />
          </DarkTooltip>
        )}
      </div>
      <h6 className='text-md text-offwhite mb-1 flex justify-start items-center'>
        <div className='min-w-[80px]'>Depth: {analysis?.depth ?? 0}</div>
        <DarkTooltip
          key={depthText}
          label={depthText}
          openDelay={1000}
          closeOnClick={true}
        >
          <div>
            {analysis?.engine === 'BROWSER' && (
              <IconButton
                icon={<CirclePlus size='18' color='white' />}
                aria-label='Increase depth'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='3xl'
                isLoading={loading.cloud}
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
            {analysis?.engine === 'CHESSRS' && !loading.cloud && (
              <Cloud color='white' size='18' fill='white' className='ml-2' />
            )}
            {analysis?.engine === 'LICHESS' && !loading.cloud && (
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
  )
}

export default AnalysisOverview
