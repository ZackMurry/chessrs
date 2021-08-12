import { Box, Heading, Text } from '@chakra-ui/react'
import { FC } from 'react'

const DashboardMoveData: FC = () => {
  return (
    <Box borderRadius='3px' bg='surface' borderWidth='2px' borderStyle='solid' borderColor='surfaceBorder' h='100%' p='5%'>
      <Heading as='h6' fontSize='2xl'>
        126 Moves Learned
      </Heading>
      <Text fontSize='18px' mt='10px'>
        23 moves need review
      </Text>
    </Box>
  )
}

export default DashboardMoveData
