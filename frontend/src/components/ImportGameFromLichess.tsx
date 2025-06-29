import { FC, useEffect, useState } from 'react'
import ndjson from 'fetch-ndjson'
import { useAppDispatch, useAppSelector } from 'utils/hooks'
import { LichessGame } from 'types'
import { Box, Button, IconButton, useBoolean } from '@chakra-ui/react'
import { flipBoard, loadMoves, Opening, resetBoard, updateOpening } from 'store/boardSlice'
import { ArrowLeft, ArrowRight, GraduationCap, RefreshCcw, X } from 'lucide-react'
import DarkTooltip from 'components/DarkTooltip'
import LichessStudyPanel from './LichessStudyPanel'

const GAMES_LOADED_PER_FETCH = 10

const ImportGameFromLichess: FC = () => {
  const { username, isDemo } = useAppSelector(state => ({
    username: state.user.account?.username,
    isDemo: state.user.account?.isDemo
  }))
  const [isDescriptionVisible, { on: showDescription, off: hideDescription }] = useBoolean(false)
  const [isLoading, { on: startLoading, off: stopLoading }] = useBoolean(false)
  const [games, setGames] = useState<LichessGame[]>([])
  const [gameIdx, setGameIdx] = useState(0)
  const [mode, setMode] = useState<'games' | 'studies'>('games')
  const dispatch = useAppDispatch()
  const lichessUsername = isDemo ? 'ZackHkk' : username

  // is this running before the user even clicks the button?
  useEffect(() => {
    const fetchGames = async () => {
      if (!username || games?.length) {
        return
      }
      startLoading()
      const response = await fetch(
        `https://lichess.org/api/games/user/${lichessUsername}?max=${GAMES_LOADED_PER_FETCH}&pgnInJson=true&tags=false&opening=true&perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence`,
        {
          headers: { Accept: 'application/x-ndjson' }
        }
      )
      const reader = response.body.getReader()
      const gen = ndjson(reader)
      const data = []
      while (true) {
        const { done, value } = await gen.next()
        if (done) {
          break
        } else {
          data.push(value)
        }
      }
      setGames(data)
      console.log(data)
      stopLoading()
    }
    fetchGames()
  }, [username, setGames, startLoading, stopLoading])

  const onExit = () => dispatch(resetBoard())

  const onLoadMore = async () => {
    if (!lichessUsername || games.length === 0) {
      return
    }
    startLoading()
    const response = await fetch(
      `https://lichess.org/api/games/user/${lichessUsername}?max=${GAMES_LOADED_PER_FETCH}&pgnInJson=true&tags=false&opening=true&perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence&until=${
        games[games.length - 1].createdAt
      }`,
      {
        headers: { Accept: 'application/x-ndjson' }
      }
    )
    const reader = response.body.getReader()
    const gen = ndjson(reader)
    const data = []
    while (true) {
      const { done, value } = await gen.next()
      if (done) {
        break
      } else {
        data.push(value)
      }
    }
    const newGames = [...games, ...data]
    setGames(newGames)
    stopLoading()
    return newGames
  }

  const importGame = (moveStr: string, isWhite: boolean, opening?: Opening) => {
    // todo: this clears analysis for starting position, which should be fixed once board and analysis slices are separated
    dispatch(resetBoard())
    dispatch(loadMoves(moveStr))
    if (opening) {
      dispatch(updateOpening(opening))
    }
    if (!isWhite) {
      dispatch(flipBoard())
    }
  }

  const loadGame = (g: LichessGame) => {
    if (!g) return
    importGame(
      g.moves,
      g.players.black.user.name !== lichessUsername,
      g.opening ? { name: g.opening.name, eco: g.opening.eco } : null
    )
  }

  const showFirstGame = () => {
    const firstGame = games[0]
    if (!firstGame) {
      setTimeout(showFirstGame, 1000)
      return
    }
    importGame(
      firstGame.moves,
      firstGame.players.black.user.name !== lichessUsername,
      firstGame.opening ? { name: firstGame.opening.name, eco: firstGame.opening.eco } : null
    )
    showDescription()
  }

  const previousGame = () => {
    if (gameIdx <= 0) {
      hideDescription()
      onExit()
      return
    }
    const prevGame = games[gameIdx - 1]
    loadGame(prevGame)
    setGameIdx(gidx => gidx - 1)
  }

  const nextGame = async () => {
    let nextGame = games[gameIdx + 1]
    if (!nextGame) {
      const newGames = await onLoadMore()
      nextGame = newGames[gameIdx + 1]
      if (!nextGame) {
        return
      }
    }
    loadGame(nextGame)
    setGameIdx(gidx => gidx + 1)
  }

  const reloadGame = () => {
    const g = games[gameIdx]
    loadGame(g)
  }

  const exitLichessAnalysis = () => {
    setGameIdx(0)
    hideDescription()
    onExit()
  }

  if (!isDescriptionVisible || !games.length) {
    return (
      <Box py='15px'>
        <Button
          variant='outline'
          color='whiteText'
          colorScheme='gray'
          _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
          onClick={showFirstGame}
        >
          Import from Lichess
        </Button>
      </Box>
    )
  }

  const exitStudies = () => {
    setMode('games')
    loadGame(games[gameIdx])
  }

  if (mode === 'studies') {
    return <LichessStudyPanel onExit={exitLichessAnalysis} onModeChange={exitStudies} />
  }

  const game = games[gameIdx]
  const gameTime = new Date(game.lastMoveAt)
  const isWhite = game.players.black.user.name !== lichessUsername
  const opponent = game.players[isWhite ? 'black' : 'white']

  // todo: arrows for next/previous
  return (
    <Box py='10px'>
      <div className='text-offwhite'>
        <h3 className='text-lg font-bold'>
          Lichess Game on {gameTime.getMonth() + 1}/{gameTime.getDate()}/{gameTime.getFullYear()}
        </h3>
        <p className='text-md'>
          {game.speed.charAt(0).toUpperCase() + game.speed.substr(1)}: {game.opening?.name ?? ''}
        </p>
        {opponent && (
          <p className='text-md'>
            Opponent:{' '}
            <a
              className='underline'
              href={`https://lichess.org/@/${opponent.user.name}`}
              rel='noopener noreferrer'
              target='_blank'
            >
              {opponent.user.name}
            </a>{' '}
            ({opponent.rating}
            {opponent.provisional && '?'})
          </p>
        )}

        <p className='text-md'>
          {/* todo: draws */}
          Result: {game.winner === 'white' ? '1-0' : '0-1'} ({isWhite === (game.winner === 'white') ? 'Win' : 'Loss'})
        </p>
        <div className='flex justify-between items-center mt-1'>
          <div className='flex justify-start items-center'>
            <DarkTooltip label='Previous game'>
              <IconButton
                icon={<ArrowLeft />}
                aria-label='Previous game'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                onClick={previousGame}
              />
            </DarkTooltip>
            <DarkTooltip label='Reload game'>
              <IconButton
                icon={<RefreshCcw size='18' />}
                aria-label='Reload game'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                onClick={reloadGame}
              />
            </DarkTooltip>
            <DarkTooltip label='Exit Lichess analysis'>
              <IconButton
                icon={<X />}
                aria-label='Exit Lichess analysis'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                onClick={exitLichessAnalysis}
              />
            </DarkTooltip>
            <DarkTooltip label='Next game'>
              <IconButton
                icon={<ArrowRight />}
                aria-label='Next game'
                className='!ring-none !shadow-none ml-1'
                variant='ghost'
                borderRadius='xl'
                padding='0'
                size='xs'
                // className='hover:!bg-none'
                _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                onClick={nextGame}
              />
            </DarkTooltip>
          </div>
          <DarkTooltip label='Import study'>
            <IconButton
              icon={<GraduationCap />}
              aria-label='Import study'
              className='!ring-none !shadow-none ml-1'
              variant='ghost'
              borderRadius='xl'
              padding='0'
              size='xs'
              // className='hover:!bg-none'
              _hover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              // _focus={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              _active={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
              onClick={() => setMode('studies')}
            />
          </DarkTooltip>
        </div>
      </div>
    </Box>
  )
}

export default ImportGameFromLichess
