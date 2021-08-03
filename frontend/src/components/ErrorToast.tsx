import { WarningIcon } from '@chakra-ui/icons'
import { Box, Text, Flex, CloseButton } from '@chakra-ui/react'
import { FC } from 'react'

interface Props {
  onClose: () => void
  description: string
}

const ErrorToast: FC<Props> = ({ description, onClose }) => (
  <Box bg='error' borderRadius='5px' p='10px'>
    <Flex justifyContent='space-between' alignItems='center'>
      <Flex alignItems='center'>
        <WarningIcon color='white' fontSize='30px' pr='10px' />
        <Text fontSize='14px'>{description}</Text>
      </Flex>
      <CloseButton onClick={onClose} />
    </Flex>
  </Box>
)

export default ErrorToast
