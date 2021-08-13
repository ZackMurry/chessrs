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
    <Box>
      <Button
        whiteSpace='break-spaces'
        maxW='100%'
        w='100%'
        my='5px'
        variant='ghost'
        size='sm'
        onClick={onClick}
        overflow='hidden'
        pl='0px'
      >
        {game.speed.charAt(0).toUpperCase() + game.speed.substr(1)}: {game.opening?.name ?? ''} {gameTime.getMonth() + 1}/
        {gameTime.getDate()}/{gameTime.getFullYear()}
      </Button>
    </Box>
  )
}

export default LichessGamePreview
