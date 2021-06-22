import { IconButton } from '@chakra-ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { FC } from 'react'

interface Props {
  pgn: string
  onBack: () => void
  onForward: () => void
}

const BoardControlsPanel: FC<Props> = ({ pgn, onBack, onForward }) => (
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
      <IconButton icon={<ChevronLeftIcon />} aria-label='Back' onClick={onBack} />
      <IconButton icon={<ChevronRightIcon />} aria-label='Advance forward' onClick={onForward} />
    </Flex>
  </Flex>
)

export default BoardControlsPanel
