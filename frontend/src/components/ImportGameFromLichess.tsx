import { FC, useEffect, useState } from 'react'
import ndjson from 'fetch-ndjson'
import { useAppSelector } from 'utils/hooks'
import { LichessGame } from 'types'
import LichessGamePreview from './LichessGamePreview'
import { Box, Button, Flex, useBoolean } from '@chakra-ui/react'
import { Opening } from 'store/boardSlice'

interface Props {
  onImport: (moves: string, isWhite: boolean, opening?: Opening) => void
}

const GAMES_LOADED_PER_FETCH = 10

const ImportGameFromLichess: FC<Props> = ({ onImport }) => {
  const { username } = useAppSelector(state => ({ username: state.user.account?.username }))
  const [isSelectorVisible, { on: showSelector, off: hideSelector }] = useBoolean(false)
  const [isLoading, { on: startLoading, off: stopLoading }] = useBoolean(false)
  const [games, setGames] = useState<LichessGame[]>([])

  useEffect(() => {
    const fetchGames = async () => {
      if (!username) {
        return
      }
      startLoading()
      const response = await fetch(
        `https://lichess.org/api/games/user/${username}?max=${GAMES_LOADED_PER_FETCH}&pgnInJson=true&tags=false&opening=true&perfType=ultraBullet,bullet,blitz,rapid,classical,correspondence`,
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
    setGames([...games, ...data])
    stopLoading()
  }

  if (!isSelectorVisible) {
    return (
      <Box py='15px'>
        <Button variant='ghost' onClick={showSelector}>
          Import from Lichess
        </Button>
      </Box>
    )
  }

  return (
    <Box maxH='15vh' overflowY='auto' py='10px'>
      {games.map(game => (
        <LichessGamePreview
          key={game.id}
          game={game}
          onClick={() => {
            hideSelector()
            onImport(
              game.moves,
              game.players.black.user.name !== username,
              game.opening ? { name: game.opening.name, eco: game.opening.eco } : null
            )
          }}
        />
      ))}
      <Flex justifyContent='center'>
        <Button
          variant='outline'
          bg='btnBg'
          borderColor='btnBorder'
          onClick={onLoadMore}
          size='xs'
          isLoading={isLoading}
          overflowWrap='break-word'
          mr='5px'
        >
          More
        </Button>
        <Button
          ml='5px'
          variant='outline'
          bg='btnBg'
          borderColor='btnBorder'
          onClick={hideSelector}
          size='xs'
          overflowWrap='break-word'
        >
          Close
        </Button>
      </Flex>
    </Box>
  )
}

export default ImportGameFromLichess
