import { FC, useEffect, useState } from 'react'
import ndjson from 'fetch-ndjson'
import { useAppSelector } from 'utils/hooks'
import { LichessGame } from 'types'
import { Box, Button, Flex, IconButton, useBoolean } from '@chakra-ui/react'
import { Opening } from 'store/boardSlice'
import { ArrowLeft, ArrowRight, RefreshCcw, X } from 'lucide-react'
import DarkTooltip from 'components/DarkTooltip'

interface Props {
  onImport: (moves: string, isWhite: boolean, opening?: Opening) => void
  onExit: () => void
}

const GAMES_LOADED_PER_FETCH = 10

const ImportGameFromLichess: FC<Props> = ({ onImport, onExit }) => {
  const { username } = useAppSelector((state) => ({
    username: state.user.account?.username,
  }))
  const [isDescriptionVisible, { on: showDescription, off: hideDescription }] =
    useBoolean(false)
  const [isLoading, { on: startLoading, off: stopLoading }] = useBoolean(false)
  const [games, setGames] = useState<LichessGame[]>([])
  const [gameIdx, setGameIdx] = useState(0)

  // is this running before the user even clicks the button?
  useEffect(() => {
    const fetchGames = async () => {
      if (!username || games?.length) {
        return
      }
      startLoading()
      const response = await fetch(
        `https://lichess.org/api/games/user/${username}?max=${GAMES_LOADED_PER_FETCH}&pgnInJson=true&tags=false&opening=true&perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence`,
        {
          headers: { Accept: 'application/x-ndjson' },
        },
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

  const onLoadMore = async () => {
    if (!username || games.length === 0) {
      return
    }
    startLoading()
    const response = await fetch(
      `https://lichess.org/api/games/user/${username}?max=${GAMES_LOADED_PER_FETCH}&pgnInJson=true&tags=false&opening=true&perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence&until=${
        games[games.length - 1].createdAt
      }`,
      {
        headers: { Accept: 'application/x-ndjson' },
      },
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

  const loadGame = (g: LichessGame) => {
    if (!g) return
    onImport(
      g.moves,
      g.players.black.user.name !== username,
      g.opening ? { name: g.opening.name, eco: g.opening.eco } : null,
    )
  }

  const showFirstGame = () => {
    const firstGame = games[0]
    if (!firstGame) {
      setTimeout(showFirstGame, 1000)
      return
    }
    onImport(
      firstGame.moves,
      firstGame.players.black.user.name !== username,
      firstGame.opening
        ? { name: firstGame.opening.name, eco: firstGame.opening.eco }
        : null,
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
    setGameIdx((gidx) => gidx - 1)
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
    setGameIdx((gidx) => gidx + 1)
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

  const game = games[gameIdx]
  const gameTime = new Date(game.lastMoveAt)
  const isWhite = game.players.black.user.name !== username
  const opponent = game.players[isWhite ? 'black' : 'white']

  // todo: arrows for next/previous
  return (
    <Box py='10px'>
      <div className='text-offwhite'>
        <h3 className='text-lg font-bold'>
          Lichess Game on {gameTime.getMonth() + 1}/{gameTime.getDate()}/
          {gameTime.getFullYear()}
        </h3>
        <p className='text-md'>
          {game.speed.charAt(0).toUpperCase() + game.speed.substr(1)}:{' '}
          {game.opening?.name ?? ''}
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
          Result: {game.winner === 'white' ? '1-0' : '0-1'} (
          {isWhite === (game.winner === 'white') ? 'Win' : 'Loss'})
        </p>
        <div className='flex justify-start items-center mt-1'>
          <DarkTooltip label='Previous game' openDelay={1000}>
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
          <DarkTooltip label='Reload game' openDelay={1000}>
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
          <DarkTooltip label='Exit Lichess analysis' openDelay={1000}>
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
          <DarkTooltip label='Next game' openDelay={1000}>
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
      </div>
      {/* {games.map((game) => (
        <LichessGamePreview
          key={game.id}
          game={game}
          onClick={() => {
            hideSelector()
            onImport(
              game.moves,
              game.players.black.user.name !== username,
              game.opening
                ? { name: game.opening.name, eco: game.opening.eco }
                : null,
            )
          }}
        />
      ))} */}
    </Box>
  )
}

export default ImportGameFromLichess
