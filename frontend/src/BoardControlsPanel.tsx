import { IconButton } from '@chakra-ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { FC } from 'react'

interface Props {
  pgn: string
  onBack: () => void
  onForward: () => void
  canGoBack: boolean
  canGoForward: boolean
}

const BoardControlsPanel: FC<Props> = ({ pgn, onBack, onForward, canGoBack, canGoForward }) => (
  <Flex
    flexDir='column'
    justifyContent='space-between'
    borderRadius='10px'
    bg='gray.700'
    w='100%'
    h='100%'
    p='5%'
    fontWeight='bold'
  >
    <Box>
      <Text fontSize='lg'>{pgn}</Text>
    </Box>
    <Flex>
      <IconButton icon={<ChevronLeftIcon />} aria-label='Back' onClick={onBack} disabled={!canGoBack} />
      <IconButton icon={<ChevronRightIcon />} aria-label='Advance forward' onClick={onForward} disabled={!canGoForward} />
    </Flex>
  </Flex>
)

export default BoardControlsPanel
