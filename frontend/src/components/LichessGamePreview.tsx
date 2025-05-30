import { Box, Button } from '@chakra-ui/react'
import { FC } from 'react'
import { LichessGame } from 'types'

interface Props {
  game: LichessGame
  onClick: () => void
}

const LichessGamePreview: FC<Props> = ({ game, onClick }) => {
  const gameTime = new Date(game.lastMoveAt)
  return (
    <div>
      <div className='text-offwhite'>
        {game.speed.charAt(0).toUpperCase() + game.speed.substr(1)}:{' '}
        {game.opening?.name ?? ''} {gameTime.getMonth() + 1}/
        {gameTime.getDate()}/{gameTime.getFullYear()}
      </div>
    </div>
  )
}

export default LichessGamePreview
