import { Box, Text } from '@chakra-ui/layout'
import { FC } from 'react'

interface Props {
  pgn: string
}

const BoardControlsPanel: FC<Props> = ({ pgn }) => (
  <Box borderRadius='10px' bg='gray.700' w='100%' h='100%' p='5%' fontWeight='bold'>
    <Text fontSize='lg'>{pgn}</Text>
  </Box>
)

export default BoardControlsPanel
